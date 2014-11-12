/*=====================
	AutoIt_Helper: Function for multi-threaded background http requests...
*/

#include <Windows.h>
#include <WinHTTP.h>
#include <string>
#include <cstdlib>
#include <time.h>

#pragma comment(lib, "winhttp.lib") // need to link to lib

using namespace std;

// AutoIt thread parameters
static const int INT_BUFFERSIZE = 1048576;    // Had to increase to 1MB because I was getting very big pages with some tests and it wouldn't work

// AutoIt thread parameters
struct THREAD_PARAM_COMPONENTS {
	WCHAR UserAgent[1024];						// user agent
	WCHAR HTTPVerb[1024];						// POST/GET/HEAD etc
	WCHAR Host[1024];							// Domain name for target request
	WCHAR Resource[1024];						// resource at target
	int Port;									// port on target
	WCHAR Referer[1024];						// referer
	WCHAR Headers[1024];						// headers string
	LPVOID ExtraData;							// additional data/paramaters to send
	DWORD Length;								// lenght of additional data
	DWORD TotalLenght;							// same as above for some reason
	int dwResolveTimeout;						// max time for resolving
	int dwConnectTimeout;						// max time for connection
	int dwSendTimeout;							// max time to wait while sending
	int dwReceiveTimeout;						// max time to wait for recieving responce
	WCHAR Proxy[1024];							// proxy for request
	DWORD ProxyFlags;							// flags for proxy
	DWORD SendFlags;							// send flags
	WCHAR ResponceHTML[INT_BUFFERSIZE];			// HTML from responce
	WCHAR ResponceHeaders[INT_BUFFERSIZE];		// headers from responce
	double Latency;								// return indicating total time spent in request
	int RetryTimes;								// maximum times to retry request if failures happen
	int MaxTestTime;							// maximum time to spend in request
	LPVOID httpSession;							// Session handles returned to AutoIt
	LPVOID httpConnect;							// Session handles returned to AutoIt
	LPVOID httpRequest;							// Session handles returned to AutoIt
};

DWORD WINAPI _ThreadProc(LPVOID threadData);

BOOLEAN APIENTRY DllMain(HINSTANCE hinstDLL,DWORD fdwReason,LPVOID lpvReserved)
{
	switch ( fdwReason )
	{
	case DLL_PROCESS_ATTACH:

		DisableThreadLibraryCalls( hinstDLL );// disable callbacks on new threads, we don't need them.

		break;

	case DLL_PROCESS_DETACH:

		break;
	}

	return TRUE;
} // End of DllMain

HANDLE WINAPI WinHTTP_Action(LPVOID threadData)
{
	return CreateThread(NULL,
			0,				// SIZE_T dwStackSize
			&_ThreadProc,
			threadData,		// LPVOID threadData
			0,				// DWORD dwCreationFlag
			NULL);			// LPDWORD lpThreadId

} // End of WinHTTP_Action

DWORD WINAPI _ThreadProc(LPVOID threadData)
{
	// Initialize the structure that AutoIt sent us
	THREAD_PARAM_COMPONENTS* tData = (THREAD_PARAM_COMPONENTS*)threadData;

	// Timer
	clock_t init, final;

	wstring m_charset;
	//DWORD dError;

	const unsigned int INT_RETRYTIMES = tData->RetryTimes;

	bool bRetVal = true;
	HINTERNET hSession = NULL;

	hSession = ::WinHttpOpen(
		tData->UserAgent,
		tData->ProxyFlags,
		tData->Proxy,
		WINHTTP_NO_PROXY_BYPASS,
		0 );//Note: do not use async

	if (!hSession)
		return false;

	tData->httpSession = hSession;

	WinHttpSetTimeouts(
		hSession,
		tData->dwResolveTimeout,
		tData->dwConnectTimeout,
		tData->dwSendTimeout,
		tData->dwReceiveTimeout
		);

	HINTERNET hConnect = NULL;
	hConnect = ::WinHttpConnect(
			hSession,
			tData->Host,
			tData->Port,
			0 );

	if (hConnect != NULL)
	{

		tData->httpConnect = hConnect;

		HINTERNET hRequest = NULL;
		hRequest = ::WinHttpOpenRequest(
			hConnect,
			tData->HTTPVerb,
			tData->Resource,
			TEXT("HTTP/1.1"),
			tData->Referer,
			WINHTTP_DEFAULT_ACCEPT_TYPES,
			tData->SendFlags);

		if (hRequest != NULL)
		{
			tData->httpRequest = hRequest;

			bool bGetReponseSucceed = false;
			//unsigned int iRetryTimes = 0;
			init = clock(); // start timer
			double TotalTime;

			// Retry for several times if fails, user can set option for retry times.
			//while (!bGetReponseSucceed && iRetryTimes++ < INT_RETRYTIMES) // Commented this out because calling WinHttpSendRequest the second time around causes an error
			//{
				/*
				// just to check size of strings
				int size = wcslen(tData->Headers)+1;
				WCHAR temp[100];
				swprintf(temp, 100, L"%i" ,size);
				MessageBox(0 , temp, L"test", 0);
				*/

				// Send HTTP requeest.
				if (!::WinHttpSendRequest(
					hRequest,
					tData->Headers,
					-1L, //<-- using wcslen()+1 seems to cause an invalid param error here
					tData->ExtraData,
					(DWORD) tData->Length,
					(DWORD) tData->TotalLenght,
					(DWORD) 0))
				{

					// This is just here in case I need to refrence back to how to get and view the last error of a function

					//dError = GetLastError();
					//WCHAR temp[100];
					//swprintf_s(temp, 100, L"Error: %d\nProxy: %s" , dError, tData->Proxy);
					//MessageBox(0 , temp, L"Error!", 0);
				}
				else
				{
					// Call was successfull, continue accepting whatever
					if (::WinHttpReceiveResponse(hRequest, NULL))
					{
						DWORD dwSize = 0;

						// Get the buffer size of the HTTP response header.
						BOOL bResult = ::WinHttpQueryHeaders(hRequest,
							WINHTTP_QUERY_RAW_HEADERS_CRLF,
							WINHTTP_HEADER_NAME_BY_INDEX,
							NULL,
							&dwSize,
							WINHTTP_NO_HEADER_INDEX);
						if (bResult || (!bResult && (::GetLastError() == ERROR_INSUFFICIENT_BUFFER)))
						{
							wchar_t *szHeader = new wchar_t[dwSize];
							if (szHeader != NULL)
							{
								memset(szHeader, 0, dwSize* sizeof(wchar_t));

								// Get HTTP response header.
								if (::WinHttpQueryHeaders(hRequest,
									WINHTTP_QUERY_RAW_HEADERS_CRLF,
									WINHTTP_HEADER_NAME_BY_INDEX,
									szHeader,
									&dwSize,
									WINHTTP_NO_HEADER_INDEX))
								{
									_wcslwr_s(szHeader, wcslen(szHeader)+1);
									wstring lwrHeader = szHeader;
									// get headers to our structure later

									// Try to get charset from HTTP reponse header.
									size_t iCharsetIndex = lwrHeader.find(TEXT("charset="));
									if (iCharsetIndex != wstring::npos)
									{
										iCharsetIndex += 8;     // "charset=" has 8 characters.
										int iCharsetLength = 0;
										for (size_t i = iCharsetIndex,ilen = lwrHeader.size(); i < ilen; i++)
										{
											if (i == lwrHeader.size()-1
												|| lwrHeader[i] == ' '
												|| lwrHeader[i] == ';'
												|| lwrHeader[i] == '\n')
											{
												iCharsetLength = i - iCharsetIndex;
												break;
											}
										}
										m_charset = lwrHeader.substr(iCharsetIndex, iCharsetLength);
									}
									delete[] szHeader;

									wstring resource = TEXT("");
									do
									{
										dwSize = 0;
										if (::WinHttpQueryDataAvailable(hRequest, &dwSize))
										{
											BYTE *pResponse = new BYTE[dwSize];
											if (pResponse != NULL)
											{
												memset(pResponse, 0, dwSize);
												DWORD dwRead = 0;
												if (::WinHttpReadData(hRequest,
													pResponse,
													dwSize,
													&dwRead))
												{
													// If the web page is encoded in UTF-8, it needs to be takn care of or garbage characters in the string.
													// I was looking into how to avoid this if data is gziped, the app has the ability to decompress and handle this already, encoding and compression.
													if (m_charset.find(TEXT("utf-8")) != wstring::npos)
													{
														int iLength = ::MultiByteToWideChar(CP_UTF8,
															MB_ERR_INVALID_CHARS,
															(LPCSTR)pResponse,
															dwSize,
															NULL,
															0);
														if (iLength > 0)
														{
															wchar_t *wideChar = new wchar_t[iLength + 1];
															if (wideChar != NULL)
															{
																memset(wideChar, 0, iLength * sizeof(wchar_t));
																iLength = ::MultiByteToWideChar(CP_UTF8,
																	MB_ERR_INVALID_CHARS,
																	(LPCSTR)pResponse,
																	dwSize,
																	wideChar,
																	iLength);
																if (iLength > 0)
																{
																	wchar_t oldChar = wideChar[iLength];
																	wideChar[iLength] = 0;
																	resource.append(wideChar);
																	wideChar[iLength] = oldChar;    // Hack.  Set back the original char or the delete operation leads a crash.
																}
																delete[] wideChar;
															}
														}
													}
													else
													{
														int iLength = ::MultiByteToWideChar(CP_ACP,
															MB_PRECOMPOSED,
															(LPCSTR)pResponse,
															dwSize,
															NULL,
															0);
														if (iLength > 0)
														{
															wchar_t *wideChar = new wchar_t[iLength + 1];
															if (wideChar != NULL)
															{
																memset(wideChar, 0, iLength * sizeof(wchar_t));
																iLength = ::MultiByteToWideChar(CP_ACP,
																	MB_PRECOMPOSED,
																	(LPCSTR)pResponse,
																	dwSize,
																	wideChar,
																	iLength);
																if (iLength > 0)
																{
																	wchar_t oldChar = wideChar[iLength];
																	wideChar[iLength] = 0;
																	resource.append(wideChar);
																	wideChar[iLength] = oldChar;    // Hack.  Set back the original char or the delete operation leads a crash.
																}
																delete[] wideChar;
															}
														}
													}
												}
												delete[] pResponse;
											}
										}
									}
									while (dwSize > 0);

									final=clock()-init;
									TotalTime = (double)final / ((double)CLOCKS_PER_SEC);

									// The smallest web page must contain more than 300 characters.
									if (resource.size() > 300 && TotalTime < tData->MaxTestTime)
									{

										bGetReponseSucceed = true;

										swprintf(tData->ResponceHTML, INT_BUFFERSIZE, TEXT("%s") ,resource);
										swprintf(tData->ResponceHeaders, INT_BUFFERSIZE, TEXT("%s") ,lwrHeader);
										tData->Latency = TotalTime;

									}
								}
							}
						}
					}
				}
			//}

			::WinHttpCloseHandle(hRequest);
		}
		::WinHttpCloseHandle(hConnect);
	}

	::WinHttpCloseHandle(hSession);

	return 1;
} // End of _ThreadProc