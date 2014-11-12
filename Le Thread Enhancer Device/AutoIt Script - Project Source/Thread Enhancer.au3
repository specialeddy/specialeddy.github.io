#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Icon=inc\ico\FavIco.ico
#AutoIt3Wrapper_Outfile=..\Le Thread Enhancer Device.exe
#AutoIt3Wrapper_Compression=4
#AutoIt3Wrapper_UseUpx=n
#AutoIt3Wrapper_Res_Description=Some kind of program.
#AutoIt3Wrapper_Res_Fileversion=1.0.0.9
#AutoIt3Wrapper_Res_Fileversion_AutoIncrement=y
#AutoIt3Wrapper_Res_LegalCopyright=ScriptKitty
#AutoIt3Wrapper_Res_Language=1033
#AutoIt3Wrapper_Res_Field=WebSite|http://the.jewpony.com/
#AutoIt3Wrapper_Res_Field=Contact|SouthSidePonyClick@Gmail.com
#AutoIt3Wrapper_Res_Icon_Add=inc\ico\ready.ico
#AutoIt3Wrapper_Res_Icon_Add=inc\ico\red.ico
#AutoIt3Wrapper_Res_Icon_Add=inc\ico\green.ico
#AutoIt3Wrapper_Res_Icon_Add=inc\ico\blue.ico
#AutoIt3Wrapper_Res_Icon_Add=inc\ico\idle.ico
#AutoIt3Wrapper_Run_Obfuscator=y
#Obfuscator_Parameters=/so
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****

Global Enum $ICO_READY = 201, $ICO_RED, $ICO_GREEN, $ICO_BLUE, $ICO_IDLE

Global $hBanBusterDLL = DllOpen('banbuster.dll')
If $hBanBusterDLL = -1 Then
	$hBanBusterDLL = DllOpen('.\BanBuster dll\Debug\AutoIt_Helper.dll')
	If $hBanBusterDLL = -1 Then
		$hBanBusterDLL = DllOpen('AutoIt_Helper.dll')
		If $hBanBusterDLL = -1 Then
			MsgBox(16, "Error!", "Cannot locate banbuster.dll")
			Exit
		EndIf
	EndIf
EndIf

#include <ButtonConstants.au3>
#include <GUIConstantsEx.au3>
#include <GUIListBox.au3>
#include <ListViewConstants.au3>
#include <StaticConstants.au3>
#include <WindowsConstants.au3>
#include <MenuConstants.au3>
#include <GuiListView.au3>
#include <EditConstants.au3>
#include <array.au3>
#include <GuiStatusBar.au3>

#include <Constants.au3>
#include <MemoryConstants.au3>
#include <Memory.au3>
#include <GDIPlus.au3>

#include ".\inc\WinHttp.au3"
#include ".\inc\ZLIB.au3"
#include ".\inc\PonyPics.au3"

#region - BanBuster DLL -

;~ Global $SEM_NOALIGNMENTFAULTEXCEPT = 0x0004
;~ Global $SEM_FAILCRITICALERRORS = 0x0001
;~ Global $SEM_NOGPFAULTERRORBOX = 0x0002
;~ Global $GAGA = DllCall($hKERNEL32, "BOOL", "SetErrorMode", "UINT", some value to test with);
Global $EXITCODE_ERROR = 1; these exitcodes are what the DLL threads return
Global $EXITCODE_OK = 0; this one means that a thread exited after successfully compleating something.
Global $EXITCODE_RUNNING = 259; only this one is currently used, this is returned to signify that a thread has not finished
;Global $ResultsArray; this was going to be used for a DLL callback, but eventually the callback was replaced by a mailslots communication method because callbacks crash AutoIt when calling from another thread, even though the callback was called once at a time in steps, it just never worked due to autoit intrenal stuff or something
;~ Global $CallBack = DllCallbackRegister("_AutoItCallBack", "none", "wstr;str;double"); register a callback function to use in the DLL
;~ Global $pCallback = DllCallbackGetPtr($CallBack)

Global $tURL_COMPONENTS, $tOptional, $pOptional

Global $Thread; used to hold the thread handles so we can later deal with them
Global $INT_BUFFERSIZE = 1048576
Global $tagTHREAD_PARAMETERS = _
		"WCHAR UserAgent[1024];" & _							;	user agent
		"WCHAR HTTPVerb[1024];" & _								;	POST/GET/HEAD etc
		"WCHAR Host[1024];" & _									;	ex: google.com
		"WCHAR Resource[1024];" & _								;	ex: /somescript.php
		"int Port;" & _											;	80/443
		"WCHAR Referer[1024];" & _								;	optional referer
		"WCHAR Headers[1024];" & _								;	null terminated request headers
		"ptr ExtraData;" & _									;	pointer to structure with arguments ex: a=1&b=2&page=45
		"DWORD Length;" & _										;	lenght of the arguents
		"DWORD TotalLength;" & _								;	same as above
		"int dwResolveTimeout;" & _   	  						;   Resolve timout
		"int dwConnectTimeout;" & _   	  						;   Connection timout
		"int dwSendTimeout;" & _        						;   Send timeout
		"int dwReceiveTimeout;" & _     						;   Recieve timeout
		"WCHAR Proxy[1024];" & _								;	proxy string
		"DWORD ProxyFlags;" & _									;	WinHTTP open flags
		"DWORD SendFlags;" & _									;	WinHttpOpenRequest flags
		"WCHAR ResponceHTML[" & $INT_BUFFERSIZE & "];" & _		;	HTML returned
		"WCHAR ResponceHeaders[" & $INT_BUFFERSIZE & "];" & _	;	Responce Headers
		"DOUBLE Latency;" & _									;	Responce Latency
		"int RetryTimes;" & _									;	Times to retry request with server
		"int MaxTestTime;" & _									;	max amount of time the request can run for
		"ptr httpSession;" & _
		"ptr httpConnect;" & _
		"ptr httpRequest"

#endregion - BanBuster DLL -

Global Const $hKERNEL32 = DllOpen("kernel32.dll")

Global $_WinHTTP_CurrentSession[2] = [-1, -1]
Global $CurrentCaptchaString

Global $SolvedCaptcha

Global $aPROXIES[1][9] = [[0,0]]
Global Enum $PROXY_STRING, $PROXY_HWND, $PROXY_STATS, $PROXY_REQUEST, $PROXY_ISINPOST, $PROXY_THREAD, $PROXY_POSTSTRUC, $PROXY_EXTRADATA, $PROXY_POSTTIMER
Global $PROXY_FAIL_LIMIT = 4
Global $ProxyList
Global $iCycleProxies = False
Global $ProxyIndex = 1
Global $CurrentProxyIndex

Global $BoardID, $ThreadID
Global $UserInfoArray
Global $hCurrentselection = 0
Global $ListViewHandles[1]; to keep track of highlighting crap
Global $CurrentImage
Global $ImageSelection = 0; type of image used, default is none 0

Global $Time = TimerInit()
Global $CaptchaExpire = 220000; 200 seconds or 3 minutes
Global $LastModified

Global $ThreadMakerMode = False
Global $EnableNameSync = False
Global $AnonymousBoards[3] = ["b", "s4s", "soc"]

Global $hHBmp_Empty
Global $ANGLE = 0; for image manipulation
Global $InfoState = False
Global $AnonCount = 0
Global $NamedCount = 0

Global $PreMessage = ''; information can go here to show in console...

Opt("GUIResizeMode", 802)

#Region ### START Koda GUI section ### Form=C:\Users\RedNet\Desktop\bread analytics\UI.kxf
Global $UI_MAIN = GUICreate("The ScriptKitty /b/read Device - [" & @UserName & "/" & @ComputerName & "]", 512, 527, -1, -1)
If Not @Compiled Then
	GUISetIcon(".\inc\ico\ready.ico")
Else
	GUISetIcon(@ScriptFullPath, $ICO_READY)
EndIf


GUICtrlCreateLabel("Thread: ", 8, 288, 44, 17)
Global $ThreadLink = GUICtrlCreateInput("", 56, 288, 217, 21)
Global $hThreadLink = GUICtrlGetHandle($ThreadLink)
Global $SetThread = GUICtrlCreateButton("Set", 280, 288, 35, 21)
GUICtrlSetOnEvent(-1, "ManualThreadSet")

Global $CaptchaImage = GUICtrlCreatePic("", 8, 320, 305, 57)
Global $CaptchaField = GUICtrlCreateInput("", 8, 384, 305, 21)
Global $hCaptchaField = GUICtrlGetHandle($CaptchaField)

GUICtrlCreateGroup("Post Body", 8, 8, 265, 273)
Global $Comment = GUICtrlCreateEdit("", 16, 120, 249, 145, BitOR($WS_VSCROLL,$ES_AUTOVSCROLL,$ES_WANTRETURN,$ES_MULTILINE))
Global $hComment = GUICtrlGetHandle($Comment)

Global $PASSWORD = GUICtrlCreateInput("nigger", 200, 24, 65, 21)
GuiCtrlSetTip(-1, "Password for post deletion.", "Info", 1, 3)
GUICtrlCreateLabel("PSWD:", 160, 24, 40, 17)
GuiCtrlSetTip(-1, "Password for post deletion.", "Info", 1, 3)

Global $PostNameSync = GUICtrlCreateCheckbox("Post to NameSync", 16, 24, 137, 17)
GUICtrlSetTip(-1, "Post your names to name sync!", "Information!", 1, 1)

GUICtrlCreateLabel("Name:", 16, 48, 35, 17)
GUICtrlCreateLabel("Subject:", 16, 72, 43, 17)
GUICtrlCreateLabel("Email:", 16, 96, 32, 17)

Global $Name = GUICtrlCreateInput("", 64, 48, 201, 21)
Global $Subject = GUICtrlCreateInput("", 64, 72, 201, 21)
Global $Email = GUICtrlCreateInput("", 64, 96, 201, 21)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("Image", 8, 408, 225, 89)
Global $SelectImage = GUICtrlCreateButton("Load", 184, 464, 43, 25)
GUICtrlSetState(-1, $GUI_DISABLE)
GUICtrlSetTip(-1, "If you chose custom, you need to choose and image! Otherwise, the program will post a random generated image.", "Information!", 1, 1)

Global Enum $IMAGE_NONE, $IMAGE_CUSTOM, $IMAGE_RANDOMETEXT, $IMAGE_CRYINGPONIES

Global $RADIO_RANDOM = GUICtrlCreateRadio("Rnd-Text", 24, 464, 65, 17)
GUICtrlSetTip(-1, "This will post a randomely colored image with random thread specific text!", "Information!", 1, 1)
Global $RADIO_CUSTOM = GUICtrlCreateRadio("Custom", 24, 448, 65, 17)
GUICtrlSetTip(-1, "If you chose custom, you need to choose and image! Otherwise, the program will post a random generated image.", "Information!", 1, 1)
Global $RADIO_NONE = GUICtrlCreateRadio("None", 24, 432, 65, 17)
Global $RADIO_CRYINGPONIES = GUICtrlCreateRadio("Crying Ponies", 96, 432, 81, 17)
GUICtrlSetTip(-1, "This will post randomely generated crying ponies!", "Information!", 1, 1)
Global $RADIO_1 = GUICtrlCreateRadio("Unused", 96, 448, 81, 17)
GUICtrlSetState(-1, $GUI_DISABLE)
Global $RADIO_2 = GUICtrlCreateRadio("Unused", 96, 464, 65, 17)
GUICtrlSetState(-1, $GUI_DISABLE)
GUICtrlCreateGroup("", -99, -99, 1, 1)
GUICtrlSetState($RADIO_NONE, $GUI_CHECKED)

GUICtrlCreateGroup("Proxy", 280, 8, 225, 273)
GUICtrlCreateLabel("Proxy: ", 287, 59, 36, 17)
GUICtrlSetTip(-1, "Proxy for posting. If none is entered, than you will post with your IP.", "Information!", 1, 1)
Global $ProxyInput = GUICtrlCreateInput("", 326, 55, 169, 21)
GUICtrlSetTip(-1, "Proxy for posting. If none is entered, than you will post with your IP.", "Information!", 1, 1)
Global $loadProxies = GUICtrlCreateButton("Load Proxies", 288, 24, 75, 25)
GUICtrlSetTip(-1, "Load proxies from a text file.", "Information!", 1, 1)
Global $SaveProxies = GUICtrlCreateButton("Save Proxies", 368, 24, 75, 25)
GUICtrlSetTip(-1, "Save good proxies. If you selected the "" cycle"" option and posted, than banned proxies will be ignored during the save.", "Information!", 1, 1)
Global $CycleProxies = GUICtrlCreateCheckbox("Cycle", 448, 24, 50, 17)
GUICtrlSetTip(-1, "This will make your program cycle through the selection of proxies in the list view! Say you posted once, it will use the next proxy after the current one.", "Information!", 1, 1)
Global $ProxyListView = GUICtrlCreateListView("Proxies", 288, 88, 210, 182)
Global $hProxyListView = GUICtrlGetHandle($ProxyListView)
DllCall("USER32.DLL", "lresult", "SendMessageW", "hwnd", $hProxyListView, "uint", 0x1000 + 30, "wparam", 0, "lparam", 205)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("/b/read info", 512, 8, 369, 489)
Global $ThreadList = GUICtrlCreateListView("Thread Type|Replies|ThreadID", 528, 32, 210, 118)
GUICtrlSetTip(-1, "Pony thread locator.", "Information!", 1, 1)
Global $hThreadlist = GUICtrlGetHandle($ThreadList)
DllCall("USER32.DLL", "lresult", "SendMessageW", "hwnd", $hThreadlist, "uint", 0x1000 + 30, "wparam", 0, "lparam", 78)
DllCall("USER32.DLL", "lresult", "SendMessageW", "hwnd", $hThreadlist, "uint", 0x1000 + 30, "wparam", 1, "lparam", 54)

Global $threadInfoList = GUICtrlCreateListView("PostID|Name|Subject|E-Mail", 528, 160, 338, 166)
Global $hthreadInfoList = GUICtrlGetHandle($threadInfoList)

DllCall("USER32.DLL", "lresult", "SendMessageW", "hwnd", $hthreadInfoList, "uint", 0x1000 + 30, "wparam", 0, "lparam", 70)
DllCall("USER32.DLL", "lresult", "SendMessageW", "hwnd", $hthreadInfoList, "uint", 0x1000 + 30, "wparam", 1, "lparam", 100)
DllCall("USER32.DLL", "lresult", "SendMessageW", "hwnd", $hthreadInfoList, "uint", 0x1000 + 30, "wparam", 2, "lparam", 100)

Global $cMenu = GUICtrlCreateContextMenu($threadInfoList)
Global $Quote = GUICtrlCreateMenuItem("Quote", $cMenu)

Global $Console = GUICtrlCreateEdit($PreMessage, 536, 336, 329, 153, $WS_VSCROLL+$ES_AUTOVSCROLL+$ES_READONLY)
Global $UserImage = GUICtrlCreatePic("", 752, 32, 116, 116, $SS_SUNKEN+$SS_CENTERIMAGE)
GUICtrlSetTip(-1, "This will display the user image.", "Information!", 1, 1)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("/b/read Stats", 240, 408, 265, 89)

Global $TOTALPOSTS = "Total Posts    :"
Global $INDICATOR_TOTALPOSTS = GUICtrlCreateLabel($TOTALPOSTS & " N/A", 248, 424, 112, 17)
GUICtrlSetTip(-1, "Total amount of posts in thread.", "Information!", 1, 1)
Global $ANONYMOUSPOSTS = "Anon Posts    :"
Global $INDICATOR_ANONYMOUSPOSTS = GUICtrlCreateLabel($ANONYMOUSPOSTS & " N/A", 248, 440, 116, 17)
GUICtrlSetTip(-1, "Total amount of unnamed posts in thread.", "Information!", 1, 1)
Global $NAMEDPOSTS = "Named Posts :"
Global $INDICATOR_NAMEDPOSTS = GUICtrlCreateLabel($NAMEDPOSTS & " N/A", 248, 456, 113, 17)
GUICtrlSetTip(-1, "Total amount of namefags.", "Information!", 1, 1)
Global $IMAGEREPLIES = "Img Replies    :"
Global $INDICATOR_IMAGES = GUICtrlCreateLabel($IMAGEREPLIES & " N/A", 248, 472, 111, 17)
GUICtrlSetTip(-1, "Total amount of images posted.", "Information!", 1, 1)
GUICtrlCreateLabel("UpdateRate:", 368, 424, 65, 17)

Global $UPDATE_RATE = GUICtrlCreateInput(15, 440, 424, 57, 21,$ES_READONLY)
GUICtrlCreateUpdown(-1)
GUICtrlSetLimit(-1, 130, 5)
GUICtrlSetTip(-1, "Time in seconds to check for updated on selected thread.", "Information!", 1, 1)

Global $MONITOR_MODE = GUICtrlCreateButton("Bread Monior Mode: Off", 368, 464, 131, 25)
GUICtrlSetTip(-1, "Turn off/on thread monitoring mode.", "Information!", 1, 1)
GUICtrlCreateGroup("", -99, -99, 1, 1)

Global $Image = GUICtrlCreatePic("", 386, 290, 116, 116, $SS_SUNKEN+$SS_CENTERIMAGE)

Global $Archive = GUICtrlCreateDummy() ;GUICtrlCreateButton("Archive", 320, 288, 59, 25)
;GUICtrlSetTip(-1, "This will archive the selected thread and make it navigable locally on your PC, it will also download all images, thumbnails and full res.", "Information!", 1, 1)
Global $GDI_STATUS = GUICtrlCreatePic("", 320, 320, 60, 84)

Global $hENTER = GUICtrlCreateDummy()
GUICtrlSetOnEvent(-1, "_ENTER")
Global $aAccelKeys[1][2] = [["{ENTER}", $hENTER]]
GUISetAccelerators($aAccelKeys)

Global $hStatusBar
Global $progress
Global $hProgress

#EndRegion ### END Koda GUI section ###

_Initialize()

While 1
	Sleep(100)
	;FixIt()
WEnd

#Region - BREAD INFO -

Func _GetThreadInfo($Board, $Thread)
	If Not $Board Or Not $Thread Then Return SetError(1,0,0)
	Local $NameSync = GetNameSyncInfo($Board, $Thread)
	Local $4chanAPI = _Get4chanAPIinfo($Board, $Thread)

	;0-postID
	;1-name
	;2-subject
	;3-email
	;4-image
	;5-comment

	Local $BuiltThread = _BuildThread($NameSync, $4chanAPI)
	If not @error Then $UserInfoArray = $BuiltThread

	_GUICtrlListView_DeleteAllItems($hthreadInfoList)
	GUICtrlSetImage($UserImage, "")
	GUICtrlSetData($Console, "")

	Local $RE_Relace[7][2] = [ _
		["&quot;",""""], _
		["&#039;", "'"], _
		["&amp;","&"], _
		["&gt;",">"], _
		["&lt;","<"], _
		["\\/","/"], _
		["#"," !"] _
	]

	Local $Indexes = UBound($BuiltThread)
	If $Indexes Then
		ReDim $ListViewHandles[$Indexes]
	Else
		ReDim $ListViewHandles[1]
		$ListViewHandles[0] = ''
	EndIf

	For $I = 0 To $Indexes -1
		GUICtrlSetData($progress, 100 * $I / $Indexes-1)
		If Not ($BuiltThread[$I][1] == "Anonymous") Then
			For $X = 0 To UBound($RE_Relace) -1
				$BuiltThread[$I][1] = StringRegExpReplace($BuiltThread[$I][1], $RE_Relace[$X][0], $RE_Relace[$X][1])
			Next
			$NamedCount += 1
		Else
			$AnonCount += 1
		EndIf

		$ListViewHandles[$I] = GUICtrlCreateListViewItem($BuiltThread[$I][0] & "|" & $BuiltThread[$I][1] & "|" & $BuiltThread[$I][2] & "|" & $BuiltThread[$I][3], $threadInfoList)
		GUICtrlSetBkColor(-1, 0xE3FFE7)
	Next

	GUICtrlSetData($progress, 0)

	GUICtrlSetData($INDICATOR_TOTALPOSTS, $TOTALPOSTS & " " & _GUICtrlListView_GetItemCount($hthreadInfoList))
	GUICtrlSetData($INDICATOR_ANONYMOUSPOSTS, $ANONYMOUSPOSTS & " " & $AnonCount)
	GUICtrlSetData($INDICATOR_NAMEDPOSTS, $NAMEDPOSTS & " " & $NamedCount)

	AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)

EndFunc

Func _UpdateThreadInfo()

	If Not $BoardID Or Not $ThreadID Then
		AdlibUnRegister("_UpdateThreadInfo")
		If @Compiled Then
			GUISetIcon(@ScriptFullPath, $ICO_READY)
		Else
			GUISetIcon(".\inc\ico\blue.ico")
		EndIf
		Return
	EndIf

	Local $NameSync
	If $EnableNameSync Then $NameSync = GetNameSyncInfo($BoardID, $ThreadID)
	Local $4chanAPI = _Get4chanAPIinfo($BoardID, $ThreadID)

	Local $BuiltThread = _BuildThread($NameSync, $4chanAPI)
	If @error Then Return

	Local $ID, $Success, $New[999][6], $Count = 0, $List = False

	Local $RE_Relace[7][2] = [ _
		["&quot;",""""], _
		["&#039;", "'"], _
		["&amp;","&"], _
		["&gt;",">"], _
		["&lt;","<"], _
		["\\/","/"], _
		["#"," !"] _
	]

	Local $Limit = UBound($BuiltThread) -1

	For $I = 0 To $Limit
		GUICtrlSetData($progress, 100 * $I / $Limit)
		For $X = 0 To UBound($UserInfoArray) -1
			If $BuiltThread[$I][0] == $UserInfoArray[$X][0] Then
				$Success = True
				ExitLoop
			EndIf
			$Success = False
		Next
		If Not $Success Then
			If Not ($BuiltThread[$I][1] == "Anonymous") Then
				For $X = 0 To UBound($RE_Relace) -1
					$BuiltThread[$I][1] = StringRegExpReplace($BuiltThread[$I][1], $RE_Relace[$X][0], $RE_Relace[$X][1])
				Next
				$NamedCount += 1
			Else
				$AnonCount += 1
			EndIf
			$New[$Count][0] = $BuiltThread[$I][0]
			$New[$Count][1] = $BuiltThread[$I][1]
			$New[$Count][2] = $BuiltThread[$I][2]
			$New[$Count][3] = $BuiltThread[$I][3]
			$Count += 1
			$Success = False
			$List = True
		EndIf
	Next

	If Not $List Then
		AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
		Return
	EndIf

	ReDim $New[$Count][6]

	$UserInfoArray = $BuiltThread
	$Limit =  UBound($ListViewHandles)-1

	For $I = 0 To $Limit
		GUICtrlSetData($progress, 100 * $I / $Limit)
		GUICtrlSetBkColor($ListViewHandles[$I], 0xFFFFFF)
	Next

	ReDim $ListViewHandles[$Count]
	$Limit = UBound($New)-1

	For $I = 0 To $Limit
		GUICtrlSetData($progress, 100 * $I / $Limit)
		$ListViewHandles[$I] = GUICtrlCreateListViewItem($New[$I][0] & "|" & $New[$I][1] & "|" & $New[$I][2] & "|" & $New[$I][3], $threadInfoList)
		GUICtrlSetBkColor(-1, 0xE3FFE7)
		;ConsoleWrite($New[$I][1] & "|" & $New[$I][2] & @CR)
	Next

	GUICtrlSetData($INDICATOR_TOTALPOSTS, $TOTALPOSTS & " " & _GUICtrlListView_GetItemCount($hthreadInfoList))
	GUICtrlSetData($INDICATOR_ANONYMOUSPOSTS, $ANONYMOUSPOSTS & " " & $AnonCount)
	GUICtrlSetData($INDICATOR_NAMEDPOSTS, $NAMEDPOSTS & " " & $NamedCount)

	GUICtrlSetData($progress, 0)

	FixIt()

	AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
EndFunc

Func SetUserInfo()
	AdlibUnRegister("SetUserInfo")
	_WinAPI_DeleteObject(GUICtrlSendMsg($UserImage, 0x0172, 0, $hHBmp_Empty))
	Local $ID = FetchListViewEntry($threadInfoList, 0, 0)
	Local $Index = False
	For $I = 0 To UBound($UserInfoArray)-1
		If $ID = $UserInfoArray[$I][0] Then
			$Index = $I
			ExitLoop
		EndIf
	Next

	If $Index = -1 Then Return MsgBox(16, "Error", "Unable to find information on this post ;_;")

	GUICtrlSetData($Console, $UserInfoArray[$Index][5])
	If Not $UserInfoArray[$Index][4] Then
		GUICtrlSetImage($UserImage, "")
		Return
	EndIf
	$Img = _WinHTTP_Action($UserInfoArray[$Index][4], "GET", True)
	If @error Then Return SetError(2, 0, 0)
	$Img = $Img[0]
	$Img = Load_BMP_From_Mem($Img, True)
	_WinAPI_DeleteObject(GUICtrlSendMsg($UserImage, 0x0172, 0, $Img))
EndFunc

Func _Get4chanAPIinfo($Board, $Thread)

	Local $Test, $Headers, $userAgent = "User-Agent: Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1348.0 Safari/537.21"
	If $LastModified Then
		$Headers = _
		"Connection: Keep-alive" & @CRLF & _
		"Accept: */*" & @CRLF & _
		"If-Modified-Since: " & $LastModified & @CRLF & _
		"Accept-Encoding: gzip;q=1,*;q=0" & @CRLF & _
		"Accept-Language: en-US,en;q=0.8" & @CRLF & _
		"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF
	Else
		$Headers = Default
	EndIf
	Local $Return = _WinHTTP_Action("https://api.4chan.org/" & $Board & "/thread/"&$Thread&".json", "GET", Default, $userAgent, $Headers)
;~ 	ConsoleWrite( _
;~ 		"HEADERS: " & $Return[1] & @CRLF & @CRLF & _
;~ 		"HTML: " & $Return[0] & @CRLF & @CRLF _
;~ 		)
	If @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, 'Status: Error("'&@error&'")', 0)
		Return SetError(1, 0, 0)
	Else
		Local $check = StringRegExp($Return[1], "(?i)Last-Modified:\h([^\r\n]+)\r\n", 3)
		If Not @error Then
			$check = $check[0]
			If $check == $LastModified Then
				;ConsoleWrite("Skipping since it's not modified..." & @CR)
				Return
			EndIf
			$LastModified = $check
		EndIf

		If StringRegExp($Return[0], "Please try again soon.") Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: 4chan API returned an error: please try again soon...", 0)
			If not @Compiled Then
				GUISetIcon(".\inc\ico\blue.ico")
			Else
				GUISetIcon(@ScriptFullPath, $ICO_BLUE)
			EndIf
		ElseIf StringRegExp($Return[1], "304 Not Modified") Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: 304 Not Modified. (No updates to show)", 0)
			If not @Compiled Then
				GUISetIcon(".\inc\ico\idle.ico")
			Else
				GUISetIcon(@ScriptFullPath, $ICO_IDLE)
			EndIf
		ElseIf StringRegExp($Return[1], "404 Not Found") Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: 404 Not Found for ThreadID: " & $ThreadID, 0)
			If not @Compiled Then
				GUISetIcon(".\inc\ico\red.ico")
			Else
				GUISetIcon(@ScriptFullPath, $ICO_RED)
			EndIf
			AdlibUnRegister("_UpdateThreadInfo")

		ElseIf StringRegExp($Return[1], "200 OK") Then
			If not @Compiled Then
				GUISetIcon(".\inc\ico\green.ico")
			Else
				GUISetIcon(@ScriptFullPath, $ICO_GREEN)
			EndIf
		Else
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: 4chan API returned something unknown...", 0)
			If not @Compiled Then
				GUISetIcon(".\inc\ico\blue.ico")
			Else
				GUISetIcon(@ScriptFullPath, $ICO_BLUE)
			EndIf
		EndIf
	EndIf

	Return SetError(0,0, $Return[0])
EndFunc

Func GetNameSyncInfo($Board, $Thread)
	Local $headers = "Connection: keep-alive" & @CRLF & _
		"X-Requested-With: NameSync4.6.1" & @CRLF & _
		"Access-Control-Request-Method:	GET" & @CRLF & _
		"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" & @CRLF & _
		"Access-Control-Request-Headers: if-modified-since,x-requested-with" & @CRLF & _
		"Accept-Encoding: gzip,deflate,sdch" & @CRLF & _
		"Accept-Language: en-US,en;q=0.8" & @CRLF & _
		"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF

	Local $userAgent = "User-Agent: Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1348.0 Safari/537.21"
	$Return = _WinHTTP_Action("https://www.namesync.org/namesync/qp.php?t=" & $Thread & "&b=" & $Board, "GET", Default, Default, $headers)
	If @error Then Return SetError(1, 0, 0)

	Return SetError(0,0, $Return[0])
EndFunc

Func GetNameSyncInfoFormatted($Board, $Thread)
	Local $headers = "Connection: keep-alive" & @CRLF & _
		"X-Requested-With: NameSync4.6.1" & @CRLF & _
		"Access-Control-Request-Method:	GET" & @CRLF & _
		"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" & @CRLF & _
		"Access-Control-Request-Headers: if-modified-since,x-requested-with" & @CRLF & _
		"Accept-Encoding: gzip,deflate,sdch" & @CRLF & _
		"Accept-Language: en-US,en;q=0.8" & @CRLF & _
		"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF

	Local $userAgent = "User-Agent: Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1348.0 Safari/537.21"
	$Return = _WinHTTP_Action("https://www.namesync.org/namesync/qp.php?t=" & $Thread & "&b=" & $Board, "GET", Default, Default, $headers)
	If @error Then Return SetError(1, 0, 0)


	$MilkyNames = StringRegExp($Return[0], "{([^}]*)}", 3)
	Local $UserInfo[9999][6], $Milky
	Local $RE_Relace[3][2] = [ _
		["\","\\"], _
		["\\/","/"], _
		["#"," !"] _
	]

	For $X = 0 To UBound($MilkyNames) - 1
		$Milky = StringRegExp($MilkyNames[$X], '"n":"([^"]*)".*?"e":"([^"]*)".*?"s":"([^"]*)".*?"p":"([^"]\d*)".*?"t":"([^"]*)"', 3)
		_ArrayDisplay($Milky)
		For $R = 0 To UBound($RE_Relace) - 1
			$UserInfo[$X][1] = StringRegExpReplace($Milky[0]&$Milky[4], $RE_Relace[$R][0], $RE_Relace[$R][1]); name
			$UserInfo[$X][2] = StringRegExpReplace($Milky[2], $RE_Relace[$R][0], $RE_Relace[$R][1]); Subject
			$UserInfo[$X][3] = StringRegExpReplace($Milky[1], $RE_Relace[$R][0], $RE_Relace[$R][1]); Email
		Next
		$UserInfo[$X][0] = $Milky[3]; ID
	Next

	ReDim $UserInfo[UBound($MilkyNames)][6]
	Return $UserInfo

EndFunc

Func GetThreads()
	;ConsoleWrite("Checking New Threads " & @MIN & "." & @SEC & @CR)
	Local $headers = "Connection: keep-alive" & @CRLF & _
		"Accept: application/json, text/javascript, */*; q=0.01" & @CRLF & _
		"X-Requested-With: TripfagFinder2.0.2" & @CRLF & _
		"Referer: ScriptKitty" & @CRLF & _
		"Accept-Encoding: gzip,deflate,sdch" & @CRLF & _
		"Accept-Language: en-US,en;q=0.8" & @CRLF & _
		"Content-Type: application/x-www-form-urlencoded; charset=UTF-8" & @CRLF

	Local $Return = _WinHTTP_Action("https://api.b-stats.org/finder/api.php", "POST", Default, Default, $headers, "a=get&t=&p=null&ap=null&v=2.0.2")
	If @error Then Return

	;ConsoleWrite($Return[0] & @CR)
;{"thread":"545103096","type":"animu","votes":1,"tim":"1399253710122","r":"148","i":"30"}
	$Result = StringRegExp($Return[0], '"thread":"(\d*)".*?"type":"([a-zA-Z]*)".*?"r":"?([a-zA-Z0-9]*)"?', 3)
	If @error Then
		_GUICtrlListView_DeleteAllItems($hThreadList)
		GUICtrlCreateListViewItem("No Threads|N/A", $ThreadList)
		AdlibRegister("GetThreads", 15000)
		Return SetError(1, 0, 0)
	EndIf

	;_ArrayDisplay($Result)

	Local $Test = _GUICtrlListView_GetItemText($hThreadList, 0, 0)

	If StringInStr($Test, "thread", 2) Or Not($Test) Then; just delete everything and add new stuff
		_GUICtrlListView_DeleteAllItems($hThreadList)
		For $I = 1 To UBound($Result) - 1 Step 3
			GUICtrlCreateListViewItem($Result[$I] & "|" & $Result[$I+1] & "|" & $Result[$I-1], $ThreadList)
		Next
		AdlibRegister("GetThreads", 30000)
		Return
	EndIf

	Local $Count = 0
	Local $New[999][3]

	For $I = 1 To UBound($Result) - 1 Step 3
		$New[$Count][0] = $Result[$I]
		$New[$Count][1] = $Result[$I+1]
		$New[$Count][2] = $Result[$I-1]
		$Count += 1
	Next

	If $Count Then ReDim $New[$Count][3]

	Local $Tracker = 0, $Item
	If Not IsArray($New) Then Return

	#Region - Delete items not in array -

	$Count = _GUICtrlListView_GetItemCount($hThreadList)
	For $X = 0 To $Count
		$Delete = 1
		$Item = _GUICtrlListView_GetItemText($hThreadList, $X, 2)
		If Not $Item Then ExitLoop
		For $Y = 0 To UBound($New) -1
			If $Item == $New[$Y][2] Then
				$Delete = 0
			EndIf
		Next
		If $Delete Then
			_GUICtrlListView_DeleteItem($hThreadList, $X)
			$X -= 1
		EndIf
	Next

	#EndRegion - Delete items not in array -

	#Region - Update Existing Items in List View -

	$Count = _GUICtrlListView_GetItemCount($hThreadList)
	For $X = 0 To $Count
		$Item = _GUICtrlListView_GetItemText($hThreadList, $X, 2)
		For $Y = 0 To UBound($New) -1
			If $Item == $New[$Y][2] Then
				_GUICtrlListView_SetItemText($hThreadList, $X, $New[$Y][1], 1)
				_ArrayDelete($New, $Y)
				ContinueLoop 2
			EndIf
		Next
	Next

	#EndRegion - Update Existing Items in List View -

	#Region - Add New Items from Array -

	For $X = 0 To UBound($New) - 1
		$Add = True
		$Count = _GUICtrlListView_GetItemCount($hThreadList)
		For $Y = 0 To $Count
			$Item = _GUICtrlListView_GetItemText($hThreadList, $Y, 2)
			If $Item == $New[$X][2] Then $Add = False
		Next
		If $Add Then GUICtrlCreateListViewItem($New[$X][0] & "|" & $New[$X][1] & "|" & $New[$X][2], $ThreadList)
	Next

	#EndRegion - Add New Items from Array -

	AdlibRegister("GetThreads", 30000)

	Return

EndFunc

Func _BuildThread($MilkyNames, $4chanAPI)
	$4chanAPI = StringRegExpReplace($4chanAPI, "\\""", "&quot;")

	Local $Stats = StringRegExp($4chanAPI, '"posts":\s?\[\{(.*?)\}', 3)
	If @error Then Return SetError(1, 0, 0)
	$Stats = StringRegExp($Stats[0], 'replies":([^},]\d*),"images":([^},]\d*)', 3)

	Local $ReplyCount = $Stats[0]
	Local $ImageCount = $Stats[1]

	GUICtrlSetData($INDICATOR_TOTALPOSTS, $TOTALPOSTS & " " & $ReplyCount)
	GUICtrlSetData($INDICATOR_IMAGES, $IMAGEREPLIES & " " & $ImageCount)

	Local $ThreadBlocks = StringRegExp($4chanAPI, '{([^}]*)},?', 3)
	$MilkyNames = StringRegExp($MilkyNames, "{([^}]*)}", 3)
	Local $UserInfo[9999][6], $4chan, $temparray

	;0-postID
	;1-name
	;2-subject
	;3-email
	;4-image
	;5-comment

	Local $RE_Relace[8][2] = [ _
		["<br>",@CRLF], _
		["&quot;",""""], _
		["&#039;", "'"], _
		["&amp;","&"], _
		["&gt;",">"], _
		["&lt;","<"], _
		["\\/","/"], _
		["<[^>]*>",""] _
	]

	Local $Limit = UBound($ThreadBlocks) -1

	For $I = 0 to $Limit
		GUICtrlSetData($progress, 100 * $I / $Limit)
		;ConsoleWrite("#"&$I&": " & $ThreadBlocks[$I] & @CR)

		$4chan = StringRegExp($ThreadBlocks[$I], '"no":([^},]\d*)', 3)
		$UserInfo[$I][0] = Int($4chan[0])

		$4chan = StringRegExp($ThreadBlocks[$I], '"name":"([^}"]*)', 3)
		If Not @error Then $UserInfo[$I][1] = $4chan[0]

		$4chan = StringRegExp($ThreadBlocks[$I], '"trip":"([^}"]*)', 3)
		If Not @error Then $UserInfo[$I][1] &= " " & $4chan[0]

		$4chan = StringRegExp($ThreadBlocks[$I], '"com":"([^"]*)"', 3)
		If Not @error Then
			For $R = 0 To UBound($RE_Relace) - 1
				$UserInfo[$I][5] = StringRegExpReplace($4chan[0], $RE_Relace[$R][0], $RE_Relace[$R][1])
				$4chan[0] = $UserInfo[$I][5]
			Next
		EndIf

		$4chan = StringRegExp($ThreadBlocks[$I], '"ext":"([^},]*)".*"tim":([^},]\d*)', 3)
		If Not @error Then $UserInfo[$I][4] = "https://t.4cdn.org/"&$BoardID&"/" & $4chan[1] & "s.jpg"

		For $X = 0 To UBound($MilkyNames) - 1

			$temparray = StringRegExp($MilkyNames[$X], '"p":"([^"]\d*)"', 3)
			If Not @error Then
				;$Milky = StringRegExp($MilkyNames[$X], '"n":"([^"]*)","p":"([^"]\d*)","s":"([^"]*)","e":"([^"]*)"', 3)
				; ConsoleWrite($MilkyNames[$X] & @CR)
				If $UserInfo[$I][0] = Int($temparray[0]) Then
					$temparray = StringRegExp($MilkyNames[$X], '"n":"([^"]*)"', 3)
					If Not @error Then $UserInfo[$I][1] = _Decode($temparray[0])&" "

					$temparray = StringRegExp($MilkyNames[$X], '"t":"([^"]*)"', 3)
					If Not @error Then $UserInfo[$I][1] &= _Decode($temparray[0])

					$temparray = StringRegExp($MilkyNames[$X], '"s":"([^"]*)"', 3)
					If Not @error Then $UserInfo[$I][2] = _Decode($temparray[0])

					$temparray = StringRegExp($MilkyNames[$X], '"e":"([^"]*)"', 3)
					If Not @error Then $UserInfo[$I][3] = _Decode($temparray[0])
					ExitLoop
				EndIf
			EndIf
		Next
	Next

	GUICtrlSetData($progress, 0)

	ReDim $UserInfo[$I][6]

	Return $UserInfo

EndFunc

Func _Decode($code); decode json unicode... \u2556 etc
	Local $String = $code
	Local $Codes = StringRegExp($String, "\\u([[:xdigit:]]{4})", 3)
	If Not @error Then
		For $I = 0 To UBound ($Codes) - 1
			$code = StringReplace($code, "\u" & $Codes[$I], chrw(dec($Codes[$I])))
		Next
	EndIf
	Return $Code
EndFunc

Func SetSelected()
	AdlibUnRegister("SetSelected")
	$BoardID = "b"
	Local $CTRL = FetchListViewEntry($ThreadList, 2)
	If @error Then Return
	If Not Int($CTRL[0]) Then Return
	$ThreadID = $CTRL[0]
	GUICtrlSetBkColor($CTRL[1], 0xE3DEFF)
	GUICtrlSetBkColor($hCurrentselection, 0xFFFFFF)
	$hCurrentselection = $CTRL[1]
	$AnonCount = 0
	$NamedCount = 0
	_GetThreadInfo($BoardID, $CTRL[0])
	GUICtrlSetData($ThreadLink, "http://boards.4chan.org/"&$BoardID&"/thread/"&$CTRL[0])
EndFunc   ;==>SetSelected

Func ManualThreadSet()
	GUICtrlSetBkColor($hCurrentselection, 0xFFFFFF)
	_GetThreadInfo($BoardID, $ThreadID)
EndFunc

Func FetchListViewEntry($Hndl, $Item, $Array = 1)
	If Not IsNumber($Item) Then Return SetError(1, 0, 0)
	Local $String = GUICtrlRead(GUICtrlRead($Hndl))
	Local $M = StringSplit($String, "|", 2)
	If @error Then Return SetError(2, 0, 0)
	If $Array Then
		Local $Ret[2] = [$M[$Item], GUICtrlRead($Hndl)]
	Else
		Return $M[$Item]
	EndIf
	Return $Ret
EndFunc   ;==>FetchListViewEntry

Func ArchiveThread()
	AdlibUnRegister('ArchiveThread')
	AdlibUnRegister("GetThreads")
	AdlibUnRegister("_UpdateThreadInfo")

	If Not $BoardID And Not $ThreadID Then
		GUICtrlSetData($Console, "Error: No thread specified...")
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: No thread specified...")
		If $BoardID And $ThreadID Then AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
		AdlibRegister("GetThreads", 3000)
		Return
	EndIf
	Local $ThreadName, $Path = FileSelectFolder("Select save location...", @ScriptDir, 7, "", $UI_MAIN)
	If @error Then
		If $BoardID And $ThreadID Then AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
		AdlibRegister("GetThreads", 3000)
		Return
	EndIf
	If MsgBox(36, "Question...", "Do you want to name the thread?", Default, $UI_MAIN) = 6 Then
		$ThreadName = InputBox("Enter a name..", "Name the thread...", "bread")
		If @error Or Not $ThreadName Then
			If $BoardID And $ThreadID Then AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
			AdlibRegister("GetThreads", 3000)
			Return
		EndIf
	Else
		$ThreadName = Default
	EndIf
	;ConsoleWrite($BoardID & @CR & $ThreadID & @CR & $Path & @CR)
	_ArchiveThread($BoardID, $ThreadID, $Path, $ThreadName)
	If @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Archive function returned error code (" & @error & ")")
	EndIf
EndFunc

Func _ArchiveThread($Board, $Thread, $Path = Default, $ThreadName = Default)

	If Not $ThreadName Or $ThreadName = Default Then $ThreadName = False
	If Not $Path Or $Path = Default Then $Path = @ScriptDir & "\archive"

	Local $Return = _WinHTTP_Action('https://boards.4chan.org/' & $Board & '/thread/' & $Thread, "GET", Default, "(compatable; Archiver)")
	If @error Then Return SetError(1, 0, 0)

	Local $sHTML = StringRegExpReplace($Return[0], '(?:\r?\n){1,}', '')
	Local $OriginalHTML = $sHTML

	$sHTML = StringRegExpReplace($sHTML, '(?s)<!--.*?-->', '') ; removing comments
	$sHTML = StringRegExpReplace($sHTML, '(?s)<!\[CDATA\[.*?\]\]>', '') ; removing CDATA
	$sHTML = StringRegExpReplace($sHTML, '(?s)<script[^>]*?>.*?</script>', '') ; removing scripts
	$sHTML = StringRegExpReplace($sHTML, '(?s)<noscript>.*?</noscript>', '') ; removing noscript stuff
	$sHTML = StringRegExpReplace($sHTML, '(?s)<form[^>]*name="post"[^>]*>.*?</form>', '') ; removing scripts
	$sHTML = StringRegExpReplace($sHTML, 'src="//\d?\.?thumbs\.4chan\.org/.*?/thumb/([^"]*)"', 'src=".\\thumb\\$1"')
	$sHTML = StringRegExpReplace($sHTML, 'href="//images\.4chan\.org/.*?/src/([^"]*)"', 'href=".\\src\\$1"')

	$sHTML = StringRegExpReplace($sHTML, 'href="//', 'href="http://') ; fix links
	$sHTML = StringRegExpReplace($sHTML, 'src="//', 'src="http://') ; fix links

	If $ThreadName Then
		$sHTML = StringRegExpReplace($sHTML, 'href="(\d+)#p([^"]+)"', 'href="' & $ThreadName & '.html#p$2"')
	Else
		$sHTML = StringRegExpReplace($sHTML, 'href="(\d+)#p([^"]+)"', 'href="$1.html#p$2"')
	EndIf

	$sHTML = StringRegExpReplace($sHTML, '(?s)<head>.*</head>', '<head><meta charset="utf-8"><link rel="stylesheet" href=".\\style.css"><link rel="shortcut icon" href=".\\favicon.ico"><title>/b/ - Random</title></head>')

	$OriginalHTML = StringRegExpReplace($OriginalHTML, 'href="//', 'href="http://') ; fix links
	$OriginalHTML = StringRegExpReplace($OriginalHTML, 'src="//', 'src="http://') ; fix links

	;ConsoleWrite($sHTML)

	If StringRight($Path, 1) = "\" Then $Path = StringTrimRight($Path, 1)

	Local $sBoardID = $Board
	Local $iThreadID = $Thread
	Local $sThread = $Thread

	If $ThreadName Then $sThread = $ThreadName

	Local $Thumbs = $Path & "\" & $sBoardID & "\" & $sThread & "\thumb"
	Local $Src = $Path & "\" & $sBoardID & "\" & $sThread & "\src"

	If Not DirCreate($Thumbs) Then Return SetError(3, 0, 0)
	If Not DirCreate($Src) Then Return SetError(4, 0, 0)

	Local $CSS = StringRegExp($OriginalHTML, '(?s)<link\h*rel="stylesheet"\h*title="switch"\h*href="([^"]*)">', 3)
	If @error Then
		$CSS = 0
	Else
		$Return = _WinHTTP_Action($CSS[0], "GET", Default, "(compatable; Archiver)")
		If Not @error Then FileWrite($Path & "\" & $sBoardID & "\" & $sThread & "\style.css", $Return[0])
	EndIf

	If $EnableNameSync Then
		Local $RegExp, $Names = GetNameSyncInfoFormatted($sBoardID, $iThreadID)

		For $I = 0 To UBound($Names)-1
			$RegExp = '(?s)(<div class="postInfo desktop" id="pi' & $Names[$I][0] & '">' & _
						'<input type="checkbox" name="' & $Names[$I][0] & '" value="delete"> ' & _
						'<span class="subject">).*?(</span> <span class="nameBlock"><span class="name">).*?(</span>)'

			$sHTML = StringRegExpReplace($sHTML, $RegExp, "$1" & $Names[$I][2] & "$2" & $Names[$I][1] & "$3")
		Next
	EndIf

	$sHTML = StringRegExpReplace($sHTML, '(?s)(<div class="postingMode desktop">).*?(</div>)', "$1" & $sThread & "$2")

	Local $hFile = FileOpen($Path & "\" & $sBoardID & "\" & $sThread & "\" & $sThread & ".html", 128+2)
	FileWrite($hFile, $sHTML)
	FileClose($hFile)

	Local $aData = StringRegExp($OriginalHTML, '(?s)<form\h*name="delform"[^>]*>(.+?)</form>', 3)
	If Not @error Then $aData = $aData[0]

	Local $Finish

	Local $aThumbs = StringRegExp($aData, '<img\h*src="([^"]+)"[^>]*>', 3)
	If Not @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Status: Downloading thumbnails...")
		$Finish = UBound($aThumbs) - 1
		For $I = 0 To $Finish
			GUICtrlSetData($progress, 100 * $I / $Finish)
			$Temp = _WinHTTP_Action($aThumbs[$I], "GET", True, "(compatable; Archiver)")
			If Not @error Then
				$hFile = FileOpen($Thumbs & "\" & StringRegExpReplace($aThumbs[$I], '(.+)/', ""), 16+2)
				FileWrite($hFile, $Temp[0])
				FileClose($hFile)
			EndIf
		Next
	EndIf

	Local $aImages = StringRegExp($aData, '<a\h*class="fileThumb"\h*href="([^"]+)"', 3)
	If Not @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Status: Downloading full res images...")
		Local $Temp
		$Finish = UBound($aImages) - 1
		For $I = 0 To $Finish
			GUICtrlSetData($progress, 100 * $I / $Finish)
			ConsoleWrite($aImages[$I] & @CR)
			$Temp = _WinHTTP_Action($aImages[$I], "GET", True, "(compatable; Archiver)")
			If Not @error Then
				$hFile = FileOpen($Src & "\" & StringRegExpReplace($aImages[$I], '(.+)/', ""), 16+2)
				FileWrite($hFile, $Temp[0])
				FileClose($hFile)
			EndIf
		Next
	Else
		ConsoleWrite("Error" & @CR)
	EndIf

	GUICtrlSetData($progress, 0)

EndFunc

#EndRegion - BREAD INFO -

#Region - ASYNCHRONOUS POSTING -

Func _POST_CHECKSTATS()
	_GUICtrlStatusBar_SetText($hStatusBar, "Status: checking post success...", 0)

	Local $ThreadStatus
	Local $Struc
	Local $Thread
	Local $PostInProcess = False
	Local $HTML
	Local $State
	Local $POST_INFO


	For $I = 1 To $aPROXIES[0][0]

		$POST_INFO = 0

		If $aPROXIES[$I][$PROXY_ISINPOST] = True Then

			$PostInProcess = True
			$Struc = $aPROXIES[$I][$PROXY_POSTSTRUC]
			$Thread = $aPROXIES[$I][$PROXY_THREAD]

			$ThreadStatus = _GetExitCodeThread($Thread)
			If $ThreadStatus <> $EXITCODE_RUNNING Then

				$aPROXIES[$I][$PROXY_ISINPOST] = False
				$aPROXIES[$I][$PROXY_EXTRADATA] = 0

				DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $Thread, 'DWORD*', 0)
				DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $Thread)

				$aPROXIES[$I][$PROXY_THREAD] = 0

				If (StringLen(DllStructGetData($Struc, "ResponceHTML")) > 1) Then
					;DllStructGetData($Struc, "ResponceHeaders")
					$HTML = DllStructGetData($Struc, "ResponceHTML")
					$aPROXIES[$I][$PROXY_POSTSTRUC] = 0

					ConsoleWrite("Post success: " & $aPROXIES[$I][$PROXY_STRING] &  @CR)

					$POST_INFO = StringRegExp($HTML, "(?i)<!--.*?thread:(\d{1,12}),no:(\d{1,12}).*?-->", 3)
					If Not @error Then
						_GUICtrlStatusBar_SetText($hStatusBar, "Post Success!", 0)
						If GUICtrlRead($PostNameSync) = $GUI_CHECKED Then _PostName($POST_INFO[0], $POST_INFO[1])
						Sleep(500)
						$aPROXIES[$I][$PROXY_STATS] = 0
						$aPROXIES[$I][$PROXY_POSTTIMER] = TimerInit()
						ConsoleWrite("+>HTMLSTART" & @CRLF & $HTML & @CRLF & "!>HTMLEND" & @CRLF & @CRLF)
					Else
						Local $Error = _ProcessResponce($HTML, $I); just shows an error in status bar for the user
						ConsoleWrite("!>ERROR: " & $Error & @CRLF)
					EndIf


				Else
					$aPROXIES[$I][$PROXY_STATS] += 1
					$aPROXIES[$I][$PROXY_POSTSTRUC] = 0
				EndIf

				$State = $aPROXIES[$I][$PROXY_STATS]
				Select
					Case $State = 0
						GUICtrlSetBkColor($aPROXIES[$I][$PROXY_HWND], 0x85FF85)
					Case $State = 1
						GUICtrlSetBkColor($aPROXIES[$I][$PROXY_HWND], 0xFFBFBF)
					Case $State = 2
						GUICtrlSetBkColor($aPROXIES[$I][$PROXY_HWND], 0xFF9C9C)
					Case $State = 3
						GUICtrlSetBkColor($aPROXIES[$I][$PROXY_HWND], 0xFF5959)
					Case $State >= $PROXY_FAIL_LIMIT
						GUICtrlSetBkColor($aPROXIES[$I][$PROXY_HWND], 0xFF0000)
						_SaveProxyList()
				EndSelect

			EndIf
		EndIf
	Next

	If $PostInProcess Then
		AdlibRegister("_POST_CHECKSTATS", 1500)
		AdlibUnRegister("_UpdateThreadInfo")
		_GUICtrlStatusBar_SetText($hStatusBar, "Status: waiting...", 0)
	Else
		_GUICtrlStatusBar_SetText($hStatusBar, "Status: all posts completed...", 0)
		AdlibUnRegister("_POST_CHECKSTATS")
		If $BoardID And $ThreadID Then AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
		AdlibRegister("ClearStatus", 5000)
	EndIf

EndFunc

Func _CREATE_POST()

	If 500 < TimerDiff($Time) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Creating asynchronous post!", 0)
		$Time = TimerInit()
		_GetNewCaptcha()
		If @error Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Error: You failed the captcha test.", 0)
			Return
		EndIf
	Else
		Return
	EndIf

	If Not $BoardID Then
		Return _GUICtrlStatusBar_SetText($hStatusBar, "No target board specified...")
	ElseIf Not $ThreadID And Not $ThreadMakerMode Then
		Return _GUICtrlStatusBar_SetText($hStatusBar, "No target thread specified...")
	ElseIf Not $SolvedCaptcha Then
		Return _GUICtrlStatusBar_SetText($hStatusBar, "No completed captcha...")
	EndIf

	Local $CoolDowm = 30*1000	;30 seconds
	If $ThreadMakerMode Then $CoolDowm = 603*1000 ;10 minutes

	Local $Proxy

	If $aPROXIES[$ProxyIndex][$PROXY_STATS] >= $PROXY_FAIL_LIMIT Then
		Local $SuccessIndicator = False

		For $I = 1 To $aPROXIES[0][0]
			ConsoleWrite("Proxy: " & $aPROXIES[$I][$PROXY_STRING] & " CoolDown Timer: " & Floor($CoolDowm - TimerDiff($aPROXIES[$I][$PROXY_POSTTIMER])) & @CR)
			If (TimerDiff($aPROXIES[$I][$PROXY_POSTTIMER]) > $CoolDowm) _
				And ($aPROXIES[$I][$PROXY_STATS] < $PROXY_FAIL_LIMIT) _
				And Not($aPROXIES[$I][$PROXY_ISINPOST]) _
				Then

				$ProxyIndex = $I
				$SuccessIndicator = True

				ExitLoop

			EndIf
		Next

		If Not $SuccessIndicator Then
			Return _GUICtrlStatusBar_SetText($hStatusBar, "No more good proxies! If one worked, wait until a proxy has cooled down!", 0)
		EndIf
	EndIf

	$Proxy = $aPROXIES[$ProxyIndex][$PROXY_STRING]
	$CurrentProxyIndex = $ProxyIndex
	$ProxyIndex += 1
	If $ProxyIndex > $aPROXIES[0][0] Then $ProxyIndex = 1
	GUICtrlSetData($ProxyInput, $Proxy)
	_GUICtrlListView_ClickItem($hProxyListView, $CurrentProxyIndex-1, "Left", False, 1, 0)
	ControlFocus($UI_MAIN, "", $CaptchaField)

	Local $rString
	If IsArray($UserInfoArray) Then $rString = $UserInfoArray[random(1, UBound($UserInfoArray)-1, 1)][5]

	Local $FileName = _StringRandom(Random(5, 10, 1), 1) & ".png"

	Local $sComment = StringReplace(GUICtrlRead($Comment), "%random%", @CRLF & _Random())
	$sComment = StringReplace($sComment, "%unique%", _StringRandom(5, 1))

	Local $aUserAgent[] = [ _
		"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1", _
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1309.0 Safari/537.17", _
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.15 (KHTML, like Gecko) Chrome/24.0.1295.0 Safari/537.15", _
		"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1284.0 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11", _
		"Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.26 Safari/537.11", _
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22" _
	]

	Local $Bounds = _StringRandom(16, 1)

	If $ImageSelection <> $IMAGE_NONE Then
		$ImageData = _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="upfile"; filename="' & $FileName & '"' & @CRLF & _
			'Content-Type: image/png' & @CRLF & @CRLF & _
			BinaryToString(Draw($ImageSelection, $rString)) & @CRLF
	Else
		$ImageData = ''
	EndIf

	Local $ContentType = _
		"Connection: keep-alive" & @CRLF & _
		"Cache-Control: no-cache" & @CRLF & _
		"Pragma: no-cache" & @CRLF & _
		"Origin: https://boards.4chan.org" & @CRLF & _
		"Content-Type: multipart/form-data; boundary=---------------------------" & $Bounds & @CRLF & _
		"Host: sys.4chan.org" & @CRLF & _
		"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" & @CRLF & _
		"Accept-Language: en-US,en;q=0.8" & @CRLF & _
		"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF

	Local $MultipartRequestBody

	If Not $ThreadMakerMode Then
		$MultipartRequestBody = _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="resto"' & @CRLF & @CRLF & _
		$ThreadID & @CRLF
	EndIf

	$MultipartRequestBody &= _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="name"' & @CRLF & @CRLF & _
		GUICtrlRead($Name) & @CRLF & _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="email"' & @CRLF & @CRLF & _
		GUICtrlRead($Email) & @CRLF & _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="sub"' & @CRLF & @CRLF & _
		GUICtrlRead($Subject) & @CRLF & _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="com"' & @CRLF & @CRLF & _
		$sComment & @CRLF & _
		$ImageData & _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="mode"' & @CRLF & @CRLF & _
		'regist' & @CRLF & _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="pwd"' & @CRLF & @CRLF & _
		'_nope' & @CRLF & _; moot seems to have disabled passwords..
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="recaptcha_challenge_field"' & @CRLF & @CRLF & _
		$SolvedCaptcha & @CRLF & _
		'-----------------------------' & $Bounds & @CRLF & _
		'Content-Disposition: form-data; name="recaptcha_response_field"' & @CRLF & @CRLF & _
		'manual_challenge' & @CRLF & _
		'-----------------------------' & $Bounds & '--'

	Local $Ref = "https://boards.4chan.org/" & $BoardID & "/thread/" & $ThreadID
	If $ThreadMakerMode Then $Ref = "https://boards.4chan.org/" & $BoardID & "/"


	#Region - MT Request -

	$tURL_COMPONENTS = DllStructCreate($tagTHREAD_PARAMETERS)

	; paramteres are
	$sOptional = $MultipartRequestBody ; parameters for the POST
	$iOptional = BinaryLen($sOptional) + 5 ; lenght of parameters
	$tOptional = DllStructCreate("byte[" & $iOptional & "]") ; prepare structure for parameters
	$pOptional = DllStructGetPtr($tOptional) ; get pointer
	DllStructSetData($tOptional, 1, $sOptional) ; set data

	DllStructSetData($tURL_COMPONENTS, "UserAgent", $aUserAgent[Random(0, UBound($aUserAgent)-1, 1)])
	DllStructSetData($tURL_COMPONENTS, "HTTPVerb", "POST")
	DllStructSetData($tURL_COMPONENTS, "Host", "sys.4chan.org")
	DllStructSetData($tURL_COMPONENTS, "Resource", $BoardID & "/post")
	DllStructSetData($tURL_COMPONENTS, "Port", $INTERNET_DEFAULT_HTTPS_PORT)

	DllStructSetData($tURL_COMPONENTS, "Referer", $Ref)
	DllStructSetData($tURL_COMPONENTS, "Headers", $ContentType)

	DllStructSetData($tURL_COMPONENTS, "ExtraData", $pOptional)
	DllStructSetData($tURL_COMPONENTS, "Length", $iOptional)
	DllStructSetData($tURL_COMPONENTS, "TotalLength", $iOptional)

	DllStructSetData($tURL_COMPONENTS, "dwResolveTimeout", 30000)
	DllStructSetData($tURL_COMPONENTS, "dwConnectTimeout", 30000)
	DllStructSetData($tURL_COMPONENTS, "dwSendTimeout", 30000) ; 15 seconds
	DllStructSetData($tURL_COMPONENTS, "dwReceiveTimeout", 30000)

	If $Proxy Then
		DllStructSetData($tURL_COMPONENTS, "Proxy", $Proxy)
		DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NAMED_PROXY)
	Else
		DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NO_PROXY)
	EndIf

	DllStructSetData($tURL_COMPONENTS, "SendFlags", BitOR($WINHTTP_FLAG_SECURE, $WINHTTP_FLAG_ESCAPE_DISABLE))

	DllStructSetData($tURL_COMPONENTS, "RetryTimes", 2)
	DllStructSetData($tURL_COMPONENTS, "MaxTestTime", 60)

	$aPROXIES[$CurrentProxyIndex][$PROXY_THREAD] = CreateThread(DllStructGetPtr($tURL_COMPONENTS))

	#EndRegion - MT Request -

	If @error Then
		Return SetError(4, 0, "Creation of thread failed.")
	EndIf

	$aPROXIES[$CurrentProxyIndex][$PROXY_EXTRADATA] = $pOptional
	$aPROXIES[$CurrentProxyIndex][$PROXY_POSTSTRUC] = $tURL_COMPONENTS
	$aPROXIES[$CurrentProxyIndex][$PROXY_ISINPOST] = True

	AdlibRegister("_POST_CHECKSTATS", 500)

	_GUICtrlStatusBar_SetText($hStatusBar, "Status: waiting...", 0)

	Return

EndFunc   ;==>_AllOfMyHate

#EndRegion - ASYNCHRONOUS POSTING -

#Region - INTERNET -

Func InitPost()
	AdlibUnRegister("InitPost")
	If 1000 < TimerDiff($Time) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Initializing post!", 0)
		_GetNewCaptcha()
		If @error Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Error: You failed the captcha test.", 0)
			Return
		Else
			$ReadReturn = _POST()
			If @error Then
				_GUICtrlStatusBar_SetText($hStatusBar, "Error("&@error&"): "&$ReadReturn, 0)
				$aPROXIES[$CurrentProxyIndex][$PROXY_STATS] += 1
			Else
				ConsoleWrite($ReadReturn[0] & @CR)
				Local $POST_INFO = StringRegExp($ReadReturn[0], "(?i)<!--.*?thread:(\d{1,12}),no:(\d{1,12}).*?-->", 3)
				If Not @error Then
					_GUICtrlStatusBar_SetText($hStatusBar, "Post Success!", 0)
					$aPROXIES[$CurrentProxyIndex][$PROXY_STATS] = 0
					If GUICtrlRead($PostNameSync) = $GUI_CHECKED Then
						_PostName($POST_INFO[0], $POST_INFO[1])
					EndIf
				Else
					_ProcessResponce($ReadReturn[0], $CurrentProxyIndex)
				EndIf
			EndIf
		EndIf

	EndIf
	Local $State = $aPROXIES[$CurrentProxyIndex][$PROXY_STATS]
	Select
		Case $State = 0
			GUICtrlSetBkColor($aPROXIES[$CurrentProxyIndex][$PROXY_HWND], 0x85FF85)
		Case $State = 1
			GUICtrlSetBkColor($aPROXIES[$CurrentProxyIndex][$PROXY_HWND], 0xFFBFBF)
		Case $State = 2
			GUICtrlSetBkColor($aPROXIES[$CurrentProxyIndex][$PROXY_HWND], 0xFF9C9C)
		Case $State = 3
			GUICtrlSetBkColor($aPROXIES[$CurrentProxyIndex][$PROXY_HWND], 0xFF5959)
		Case $State >= $PROXY_FAIL_LIMIT
			GUICtrlSetBkColor($aPROXIES[$CurrentProxyIndex][$PROXY_HWND], 0xFF0000)
			_SaveProxyList()
	EndSelect

	AdlibRegister("ClearStatus", 30000)
	AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
	$Time = TimerInit()
EndFunc

Func _POST()

	If Not $BoardID Then
		Return SetError(1,0,"No target board specified...")
	ElseIf Not $ThreadID And Not $ThreadMakerMode Then
		Return SetError(2,0,"No target thread specified...")
	ElseIf Not $SolvedCaptcha Then
		Return SetError(3,0,"No completed captcha...")
	EndIf

	Local $Proxy = GUICtrlRead($ProxyInput)

	Local $ImageData
	Local $rString
	If IsArray($UserInfoArray) Then $rString = $UserInfoArray[random(1, UBound($UserInfoArray)-1, 1)][5]

	Local $FileName = _StringRandom(Random(1, 55, 1), 1) & ".png"

	Local $sComment = StringReplace(GUICtrlRead($Comment), "%random%", @CRLF & _Random())
	$sComment = StringReplace($sComment, "%unique%", _StringRandom(5, 1))

	Local $aUserAgent[] = [ _
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1", _
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1309.0 Safari/537.17", _
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.15 (KHTML, like Gecko) Chrome/24.0.1295.0 Safari/537.15", _
		"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1284.0 Safari/537.13", _
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11", _
		"Mozilla/5.0 (Windows NT 6.2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.26 Safari/537.11", _
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22" _
	]

	Local $Bounds = _StringRandom(16, 1)

	If $ImageSelection <> $IMAGE_NONE Then
		$ImageData = _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="upfile"; filename="' & $FileName & '"' & @CRLF & _
			'Content-Type: image/png' & @CRLF & @CRLF & _
			BinaryToString(Draw($ImageSelection, $rString)) & @CRLF
	Else
		$ImageData = ''
	EndIf

	Local $ContentType = _
		"Connection: keep-alive" & @CRLF & _
		"Cache-Control: no-cache" & @CRLF & _
		"Pragma: no-cache" & @CRLF & _
		"Origin: https://boards.4chan.org" & @CRLF & _
		"Content-Type: multipart/form-data; boundary=---------------------------" & $Bounds & @CRLF & _
		"Host: sys.4chan.org" & @CRLF & _
		"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" & @CRLF & _
		"Accept-Language: en-US,en;q=0.8" & @CRLF & _
		"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF

	Local $MultipartRequestBody

	If Not $ThreadMakerMode Then
		$MultipartRequestBody = _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="resto"' & @CRLF & @CRLF & _
			$ThreadID & @CRLF
	EndIf

	$MultipartRequestBody &= _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="name"' & @CRLF & @CRLF & _
			GUICtrlRead($Name) & @CRLF & _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="email"' & @CRLF & @CRLF & _
			GUICtrlRead($Email) & @CRLF & _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="sub"' & @CRLF & @CRLF & _
			GUICtrlRead($Subject) & @CRLF & _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="com"' & @CRLF & @CRLF & _
			$sComment & @CRLF & _
			$ImageData & _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="mode"' & @CRLF & @CRLF & _
			'regist' & @CRLF & _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="pwd"' & @CRLF & @CRLF & _
			'_nope' & @CRLF & _; moot seems to have disabled passwords..
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="recaptcha_challenge_field"' & @CRLF & @CRLF & _
			$SolvedCaptcha & @CRLF & _
			'-----------------------------' & $Bounds & @CRLF & _
			'Content-Disposition: form-data; name="recaptcha_response_field"' & @CRLF & @CRLF & _
			'manual_challenge' & @CRLF & _
			'-----------------------------' & $Bounds & '--'

	Local $Ref = "https://boards.4chan.org/" & $BoardID & "/thread/" & $ThreadID
	If $ThreadMakerMode Then $Ref = "https://boards.4chan.org/" & $BoardID & "/"

	#Region - MT Request -

	$tURL_COMPONENTS = DllStructCreate($tagTHREAD_PARAMETERS)

	; paramteres are
	$sOptional = $MultipartRequestBody ; parameters for the POST
	$iOptional = BinaryLen($sOptional) + 5 ; lenght of parameters
	$tOptional = DllStructCreate("byte[" & $iOptional & "]") ; prepare structure for parameters
	$pOptional = DllStructGetPtr($tOptional) ; get pointer
	DllStructSetData($tOptional, 1, $sOptional) ; set data

	DllStructSetData($tURL_COMPONENTS, "UserAgent", $aUserAgent[Random(0, UBound($aUserAgent)-1, 1)])
	DllStructSetData($tURL_COMPONENTS, "HTTPVerb", "POST")
	DllStructSetData($tURL_COMPONENTS, "Host", "sys.4chan.org")
	DllStructSetData($tURL_COMPONENTS, "Resource", $BoardID & "/post")
	DllStructSetData($tURL_COMPONENTS, "Port", $INTERNET_DEFAULT_HTTPS_PORT)

	DllStructSetData($tURL_COMPONENTS, "Referer", $Ref)
	DllStructSetData($tURL_COMPONENTS, "Headers", $ContentType)

	DllStructSetData($tURL_COMPONENTS, "ExtraData", $pOptional)
	DllStructSetData($tURL_COMPONENTS, "Length", $iOptional)
	DllStructSetData($tURL_COMPONENTS, "TotalLength", $iOptional)

	DllStructSetData($tURL_COMPONENTS, "dwResolveTimeout", 30000)
	DllStructSetData($tURL_COMPONENTS, "dwConnectTimeout", 30000)
	DllStructSetData($tURL_COMPONENTS, "dwSendTimeout", 30000) ; 15 seconds
	DllStructSetData($tURL_COMPONENTS, "dwReceiveTimeout", 30000)

	If $Proxy Then
		DllStructSetData($tURL_COMPONENTS, "Proxy", $Proxy)
		DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NAMED_PROXY)
	Else
		DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NO_PROXY)
	EndIf

	DllStructSetData($tURL_COMPONENTS, "SendFlags", BitOR($WINHTTP_FLAG_SECURE, $WINHTTP_FLAG_ESCAPE_DISABLE))

	DllStructSetData($tURL_COMPONENTS, "RetryTimes", 2)
	DllStructSetData($tURL_COMPONENTS, "MaxTestTime", 60)

	; finally. create the thread and send it the structure and tell it what type of method to use
	;FileWrite(".\Added.txt", @HOUR & ":" & @MIN & ":" & @SEC & ":" & @MSEC & @TAB & "ScanLevel (" & $Level & ")" & @TAB & @TAB & "IP (" & $Proxies[$X][1] & ")" & @CRLF)
	Local $Thread = CreateThread(DllStructGetPtr($tURL_COMPONENTS))

	#EndRegion - MT Request -

	If @error Then
		Return SetError(4, 0, "Creation of thread failed.")
	EndIf

	Local $ThreadStatus

	For $I = 0 To 30
		Sleep(1000)
		$ThreadStatus = _GetExitCodeThread($Thread)

		If $ThreadStatus = $EXITCODE_RUNNING Then
			ContinueLoop
		Else
			ExitLoop
		EndIf

	Next

	DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $Thread, 'DWORD*', 0)
	DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $Thread)

	If (StringLen(DllStructGetData($tURL_COMPONENTS, "ResponceHTML")) > 1) Then
		Local $Return[2] = [DllStructGetData($tURL_COMPONENTS, "ResponceHTML"),DllStructGetData($tURL_COMPONENTS, "ResponceHeaders")]
		Return SetError(0, 0, $Return)
	Else
		Return SetError(5, 0, "Proxy was either too slow or resolving addresses failed...")
	EndIf

EndFunc   ;==>_AllOfMyHate

; this is used with BanBuster.dll to create proxy testing threads
Func CreateThread($param)
	Local $aCall = DllCall($hBanBusterDLL, 'HANDLE', 'WinHTTP_Action', 'ptr', $param)
	If @error Then
		ConsoleWrite("!>THREAD CREATION ERROR: " & @error & @CR)
		Return SetError(2, 0, 0)
	EndIf
	If Not IsArray($aCall) Then MsgBox(16, "Error", "Impending crash, $aCall is not an array!!!")
	If $aCall[0] = 0 Then Return SetError(3, 0, 0)
	Return SetError(0, 0 ,$aCall[0]); $aRet
EndFunc   ;==>CheckProxyInAnotherThread

Func _PostName($THREAD_ID, $POST_ID)

	Local $URL = 'https://www.namesync.org/namesync/sp.php?'

	Local $MagicHeader = 'connection: keep-alive' & @CRLF & _
			'cache-control: no-cache' & @CRLF & _
			'pragma: no-cache' & @CRLF & _
			'accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' & @CRLF & _
			'origin: https://boards.4chan.org' & @CRLF & _
			'x-requested-with: NameSync4.6.2' & @CRLF & _
			'content-type: application/x-www-form-urlencoded; charset=UTF-8' & @CRLF & _
			'accept-encoding: gzip;q=1,*;q=0' & @CRLF

	Local $sName = URLEncode(GUICtrlRead($Name))
	Local $sSubject = URLEncode(GUICtrlRead($Subject))
	Local $sEmail = URLEncode(GUICtrlRead($Email))

	Local $Params = "p=" & $POST_ID & "&t=" & $THREAD_ID & "&b=b&n=" & $sName & "&s=" & $sSubject & "&e=" & $sEmail & "&dnt=0"

	Local $UserAgent[8] = [ _
	"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11", _
	"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:7.0.1) Gecko/20100101 Firefox/7.0.1", _
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:16.0) Gecko/20100101 Firefox/16.0", _
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1", _
	"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:16.0) Gecko/20100101 Firefox/16.0", _
	"Mozilla/5.0 (Windows NT 5.1; rv:16.0) Gecko/20100101 Firefox/16.0", _
	"Mozilla/5.0 (Windows NT 5.1; rv:6.0.2) Gecko/20100101 Firefox/6.0.2" _
	]

	Local $Return = _WinHTTP_Action( _
			$URL, _
			"POST", _
			Default, _
			$UserAgent[Random(0, 6, 1)], _
			$MagicHeader, _
			$Params, _
			Default, _
			Default _
	)
	Switch @error
		Case 0
;~ 			ConsoleWrite( _
;~ 				"+===== Responce Header ====+" & @CRLF & _
;~ 				$Return[1] & @CRLF & _
;~ 				"+=====  Responce HTML  ====+" & @CRLF & _
;~ 				$Return[0] & @CRLF _
;~ 			)
		Case Else
;~ 			ConsoleWrite("Error: " & @error)
	EndSwitch

	_TerminateSession()

	Return
EndFunc

Func URLEncode($urlText)
    $url = ""
    For $i = 1 To StringLen($urlText)
        $acode = Asc(StringMid($urlText, $i, 1))
        Select
            Case ($acode >= 48 And $acode <= 57) Or _
                    ($acode >= 65 And $acode <= 90) Or _
                    ($acode >= 97 And $acode <= 122)
                $url = $url & StringMid($urlText, $i, 1)
            Case Else
                $url = $url & "%" & Hex($acode, 2)
        EndSelect
    Next
    Return $url
EndFunc   ;==>URLEncode

Func _GetNewCaptcha()
	Local $NewCaptcha = GUICtrlRead($CaptchaField)

	If Not StringInStr($NewCaptcha, " ") Then
		$NewCaptcha &= " " & $NewCaptcha
	EndIf

	$SolvedCaptcha = ''

	Local $BaseCaptchaURL = "http://www.google.com/recaptcha/api/noscript?k=6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc"
	Local $Return

	If $NewCaptcha And $CurrentCaptchaString Then
		Local $Header = "Cache-Control: max-age=0" & @CRLF & _
						"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" & @CRLF & _
						"Origin: http://www.google.com" & @CRLF & _
						"Content-Type: application/x-www-form-urlencoded" & @CRLF & _
						"Referer: http://www.google.com/recaptcha/api/noscript?k=6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc" & @CRLF & _
						"Accept-Encoding: gzip" & @CRLF & _
						"Accept-Language: en-US,en;q=0.8" & @CRLF & _
						"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF



		Local $PostURL = $BaseCaptchaURL & "&recaptcha_challenge_field=" & $CurrentCaptchaString & "&recaptcha_response_field=" & $NewCaptcha & "&submit=I%27m+a+human"
		$Return = _WinHTTP_Action(StringReplace($PostURL, " ", "+"), "POST", False, Default, $Header)
		If Not @error Then
			$Return = StringRegExp($Return[0], "<textarea.*>([^<]*)</textarea>", 3)
			If Not @error Then
				If StringLen($Return[0]) > 7 Then
					$SolvedCaptcha = $Return[0]
				EndIf
			EndIf
		EndIf

		GUICtrlSetData($CaptchaField, "")

	EndIf

	Local $Img = "http://www.google.com/recaptcha/api/image?c="

	$Return = _WinHTTP_Action($BaseCaptchaURL, "GET", False)
	If @error Then Return SetError(1, 0, 0)
	$CurrentCaptchaString = StringRegExp($Return[0], "src=""image\?c=(.*?)""", 3)
	If @error Then Return SetError(1, 0, 0)
	$CurrentCaptchaString = $CurrentCaptchaString[0]

	$Img = "http://www.google.com/recaptcha/api/image?c=" & $CurrentCaptchaString
	$Img = _WinHTTP_Action($Img, "GET", True)
	If @error Then Return SetError(2, 0, 0)
	$Img = $Img[0]
	$Img = Load_BMP_From_Mem(Binary($Img), True)
	_WinAPI_DeleteObject(GUICtrlSendMsg($CaptchaImage, 0x0172, 0, $Img))
	AdlibRegister("_GetNewCaptcha", $CaptchaExpire)
	If $SolvedCaptcha Then Return SetError(0, 0, $SolvedCaptcha)
	Return SetError(1,0,"")
EndFunc   ;==>_GetNewCaptcha

Func _WinHTTP_Action( _
		$Page, _
		$Action = Default, _
		$iBinary = Default, _
		$sUserAgent = Default, _
		$headers = Default, _
		$AdditionalData = Default, _
		$ReadReturn = Default, _
		$sReferer = Default, _
		$Proxy = Default, _
		$SessionDur = Default _
		)

	Local $DefHeaders = _
			"Connection: Keep-alive" & @CRLF & _
			"Accept: */*" & @CRLF & _
			"Accept-Encoding: gzip;q=1,*;q=0" & @CRLF & _
			"Accept-Language: en-US,en;q=0.8" & @CRLF & _
			"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF

	__WinHttpDefault($Action, "GET")
	__WinHttpDefault($iBinary, False)
	__WinHttpDefault($sUserAgent, "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.20 (KHTML, like Gecko) Chrome/25.0.1324.0 Safari/537.20")
	__WinHttpDefault($headers, $DefHeaders)
	__WinHttpDefault($ReadReturn, True)
	__WinHttpDefault($SessionDur, 60000)
	__WinHttpDefault($Proxy, False)

	If ($_WinHTTP_CurrentSession[1] <> 1) Then
		If Not _WinHttpCheckPlatform() Then Return SetError(1, 0, 0)
		$_WinHTTP_CurrentSession[1] = 1
	EndIf

	If Not $Page Then Return SetError(2, 0, 0)

	Local $Crack = _WinHttpCrackUrl($Page)
	If @error Then Return SetError(3, 0, 0)

	Local $Port = $INTERNET_DEFAULT_PORT
	Local $Flag
	Local $iCharset = 0

	If Not $Crack[0] Then $Crack[0] = "https"

	If StringLower($Crack[0]) == "http" Then
		$Port = $INTERNET_DEFAULT_HTTP_PORT
		$Flag = Default
	ElseIf StringLower($Crack[0]) == "https" Then
		$Port = $INTERNET_DEFAULT_HTTPS_PORT
		$Flag = $WINHTTP_FLAG_SECURE
	EndIf

	If ($_WinHTTP_CurrentSession[0] = -1) Then
		If $Proxy Then
			$_WinHTTP_CurrentSession[0] = _WinHttpOpen($sUserAgent, $WINHTTP_ACCESS_TYPE_NAMED_PROXY, $Proxy)
		Else
			$_WinHTTP_CurrentSession[0] = _WinHttpOpen($sUserAgent)
		EndIf
		If @error Then
			$_WinHTTP_CurrentSession[0] = -1
			Return SetError(4, 0, 0)
		EndIf
	EndIf

	AdlibRegister("_TerminateSession", $SessionDur)

	Local $hConnect = _WinHttpConnect($_WinHTTP_CurrentSession[0], $Crack[2], $Port)
	If @error Then
		_WinHttpCloseHandle($hConnect)
		Return SetError(5, 0, 0)
	EndIf

	Local $hRequest = _WinHttpOpenRequest($hConnect, $Action, $Crack[6] & $Crack[7], Default, $sReferer, Default, $Flag)
	If Not $hRequest Then
		_WinHttpCloseHandle($hConnect)
		Return SetError(6, 0, 0)
	EndIf

	If $Action == "POST" Then
		If ($headers = Default) And ($AdditionalData = Default) Then _WinHttpAddRequestHeaders($hRequest, "Content-Type: application/x-www-form-urlencoded")
	EndIf

	Local $iSize = 0
	If $AdditionalData Then $iSize = StringLen($AdditionalData)

	_WinHttpSetOption($hRequest, $WINHTTP_OPTION_REDIRECT_POLICY, $WINHTTP_OPTION_REDIRECT_POLICY_ALWAYS)

	_WinHttpSendRequest($hRequest, $headers, $AdditionalData, $iSize)
	If @error Then
		_WinHttpCloseHandle($hRequest)
		_WinHttpCloseHandle($hConnect)
		Return SetError(7, 0, 0)
	EndIf

	_WinHttpReceiveResponse($hRequest)
	If @error Then
		_WinHttpCloseHandle($hRequest)
		_WinHttpCloseHandle($hConnect)
		Return SetError(8, 0, 0)
	EndIf

	If Not $ReadReturn Then
		_WinHttpCloseHandle($hRequest)
		_WinHttpCloseHandle($hConnect)
		Return SetError(0, 0, 1)
	EndIf

	Local $Data
	If _WinHttpQueryDataAvailable($hRequest) Then
		Local $bChunk
		While 1
			$bChunk = _WinHttpReadData($hRequest, 2)
			If @error Then ExitLoop
			$Data = _WinHttpBinaryConcat($Data, $bChunk)
		WEnd
	Else
		_WinHttpCloseHandle($hRequest)
		_WinHttpCloseHandle($hConnect)
		Return SetError(9, 0, 0)
	EndIf

	Local $aReturn[2] = [$Data, _WinHttpQueryHeaders($hRequest)]

	If StringRegExp($aReturn[1], "(?im)^Content-Type:\h.*?charset\h*=\h*utf-?8") Then $iCharset = 4
	If StringRegExp($aReturn[1], "(?im)^Content-Encoding:\h+gzip") Then
		$Data = _ZLIB_GZUncompress($aReturn[0])
		If $iBinary Then
			$aReturn[0] = Binary($Data)
		Else
			$aReturn[0] = BinaryToString($Data, $iCharset)
		EndIf
	Else
		If $iBinary Then
			$aReturn[0] = Binary($Data)
		Else
			$aReturn[0] = BinaryToString($aReturn[0], $iCharset)
		EndIf
	EndIf

	_WinHttpCloseHandle($hRequest)
	_WinHttpCloseHandle($hConnect)
	Return SetError(0, 0, $aReturn)
EndFunc   ;==>_WinHTTP_Action


#EndRegion - INTERNET -

#region - WM_MESSAGES -

Func _ENTER()
	Switch _WinAPI_GetFocus()
		Case $hCaptchaField

			If $iCycleProxies Then
				_CREATE_POST()
			Else
				AdlibRegister("InitPost",10)
			EndIf

		Case $hComment

			GUISetAccelerators(0)
			ControlSend($UI_MAIN, "", $hComment, @CR)
			GUISetAccelerators($aAccelKeys)

	EndSwitch
EndFunc

Func WM_COMMAND($hWnd, $iMsg, $iwParam, $ilParam)
	#forceref $hwnd, $iMsg

	Local $iCode = BitShift($iwParam, 16)
	Local $LowWord = BitAND($iwParam, 0xFFFF)

	ConsoleWrite("ID: " & $LowWord & " = " & $iCode & @CR)

	Switch $hWnd
		Case $UI_MAIN

			Switch $LowWord
				Case $Quote
					Local $ID = FetchListViewEntry($threadInfoList, 0, 0)
					Local $Index = False
					For $I = 0 To UBound($UserInfoArray)-1
						If $ID = $UserInfoArray[$I][0] Then
							$Index = $I
							ExitLoop
						EndIf
					Next

					If $Index = -1 Then Return 'GUI_RUNDEFMSG'
					Local $QuoteText = StringRegExpReplace($UserInfoArray[$Index][5], "(.+(?:\r\n)?)", ">$1")
					GUICtrlSetData($Comment, ">>"&$ID&@CRLF&@CRLF&$QuoteText)
			EndSwitch

			Switch $ilParam
				Case $hThreadLink
					Switch $iCode
						Case $EN_CHANGE ; Sent when the user has taken an action that may have altered text in an edit control

							Local $link = GUICtrlRead($ThreadLink)
							Local $URL = StringRegExp($link, "(?i)(?:4chan.org/)([a-zA-Z0-9]{1,3})/thread/(\d{1,11})", 3)
							If Not @error Then
								$BoardID = $URL[0]
								$ThreadID = $URL[1]
								$EnableNameSync = False
								$ThreadMakerMode = False
								For $i = 0 To UBound($AnonymousBoards)-1
									If $AnonymousBoards[$I] == $BoardID Then $EnableNameSync = True
								Next
								_GUICtrlStatusBar_SetText($hStatusBar, "Status: Target set to BoardID: " & $BoardID & " and ThreadID: " & $ThreadID , 0)
							Else
								$BoardID = ''
								$ThreadID = ''
								$URL = StringRegExp($link, "(?i)(?:4chan.org/)([a-zA-Z0-9]{1,4})", 3)
								If Not @error Then
									$BoardID = $URL[0]
									$EnableNameSync = False
									$ThreadMakerMode = True
									_GUICtrlStatusBar_SetText($hStatusBar, "Status: Target set to BoardID: " & $BoardID , 0)
								Else
									_GUICtrlStatusBar_SetText($hStatusBar, "Status: No target found...", 0)
								EndIf
							EndIf

							Return $GUI_RUNDEFMSG
;~                 Case $EN_KILLFOCUS  ; Sent when an edit control loses the keyboard focus
;~ 					AdlibRegister("HideCTRL",200)
				EndSwitch
			EndSwitch

			Switch $LowWord
				Case $MONITOR_MODE
					If $InfoState Then
						$InfoState = False
						WinMove($UI_MAIN, "", Default, Default, 518, Default)
						GUICtrlSetData($MONITOR_MODE, "Bread Monior Mode: Off")
						AdlibUnRegister("GetThreads")
						AdlibUnRegister("_UpdateThreadInfo")
						GUICtrlSetData($INDICATOR_NAMEDPOSTS, $NAMEDPOSTS & " N/A")
						GUICtrlSetData($INDICATOR_TOTALPOSTS, $TOTALPOSTS & " N/A")
						GUICtrlSetData($INDICATOR_ANONYMOUSPOSTS, $ANONYMOUSPOSTS & " N/A")
						GUICtrlSetData($INDICATOR_IMAGES, $IMAGEREPLIES & " N/A")
						$AnonCount = 0
						$NamedCount = 0
					Else
						AdlibRegister("GetThreads", 3000)
						If $BoardID And $ThreadID Then AdlibRegister("_UpdateThreadInfo", GUICtrlRead($UPDATE_RATE)*1000)
						$InfoState = True
						WinMove($UI_MAIN, "", Default, Default, 894, Default)
						GUICtrlSetData($MONITOR_MODE, "Bread Monior Mode: On")
					EndIf
					AdlibRegister("FixIt", 10)

				Case $SelectImage
						Local $Img = FileOpenDialog("Select Image", "", "Images (*.jpg;*.bmp;*.png)")
						If Not @error Then
							_WinAPI_DeleteObject(GUICtrlSendMsg($Image, 0x0172, 0, $hHBmp_Empty))
							$Img = Binary(FileRead($Img))
							Local $TempImg = Load_BMP_From_Mem($Img, True)
							_WinAPI_DeleteObject(GUICtrlSendMsg($Image, 0x0172, 0, $TempImg))
							$CurrentImage = Load_BMP_From_Mem($Img)
							;Local $Pos = ControlGetPos($UI_MAIN, "", $Image)
							;GUICtrlSetPos($Image, $Pos[0], $Pos[1], $Pos[2], $Pos[3])
						EndIf
				Case $loadProxies
					_LoadProxies()

				Case $SaveProxies
					_SaveProxyList()

				Case $Archive
					AdlibRegister("ArchiveThread", 10)

				Case $CycleProxies
					If GUICtrlRead($CycleProxies) = $GUI_CHECKED Then
						$ProxyIndex = 1
						$iCycleProxies = True
					Else
						$iCycleProxies = False
					EndIf

				Case $RADIO_CUSTOM
					GUICtrlSetState($SelectImage, $GUI_ENABLE)
					$ImageSelection = $IMAGE_CUSTOM
					_WinAPI_DeleteObject(GUICtrlSendMsg($Image, 0x0172, 0, $hHBmp_Empty))

				Case $RADIO_RANDOM, $RADIO_NONE, $RADIO_CRYINGPONIES, $RADIO_1, $RADIO_2

					GUICtrlSetState($SelectImage, $GUI_DISABLE)
					_WinAPI_DeleteObject(GUICtrlSendMsg($Image, 0x0172, 0, $hHBmp_Empty))
					$CurrentImage = 0

					Switch $LowWord
						Case $RADIO_RANDOM
							$ImageSelection = $IMAGE_RANDOMETEXT

						Case $RADIO_NONE
							$ImageSelection = $IMAGE_NONE

						Case $RADIO_CRYINGPONIES
							$ImageSelection = $IMAGE_CRYINGPONIES
							Local $TempImg = Load_BMP_From_Mem(Draw($IMAGE_CRYINGPONIES), True)
							_WinAPI_DeleteObject(GUICtrlSendMsg($Image, 0x0172, 0, $TempImg))

						Case $RADIO_1, $RADIO_2
							$ImageSelection = $IMAGE_NONE

					EndSwitch

			EndSwitch
	EndSwitch

	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_COMMAND

Func WM_NOTIFY($hWnd, $iMsg, $iwParam, $ilParam)
	#forceref $hWnd, $iMsg, $iwParam, $ilParam

	Local $tNMHDR = DllStructCreate($tagNMHDR, $ilParam)
	Local $hWndFrom = HWnd(DllStructGetData($tNMHDR, "hWndFrom"))
	;Local $iIDFrom = DllStructGetData($tNMHDR, "IDFrom")
	Local $iCode = DllStructGetData($tNMHDR, "Code")

	Switch $hWndFrom
		Case $hThreadlist
			Switch $iCode
				Case $NM_DBLCLK ; Sent by a list-view control when the user double-clicks an item with the left mouse button
					AdlibRegister("SetSelected", 10)
			EndSwitch
		Case $hthreadInfoList
			Switch $iCode
				Case $NM_DBLCLK ; Sent by a list-view control when the user double-clicks an item with the left mouse button
					AdlibRegister("SetUserInfo", 10)

			EndSwitch
		Case $hProxyListView
			Switch $iCode
				Case $NM_DBLCLK ; Sent by a list-view control when the user double-clicks an item with the left mouse button
					$aItemSelected = _GUICtrlListView_HitTest($hProxyListView)
					If $aItemSelected <> -1 Then
						Local $sProxy = _GUICtrlListView_GetItemText($hProxyListView, $aItemSelected[0])
						If $sProxy Then GUICtrlSetData($ProxyInput, $sProxy)
					EndIf

			EndSwitch
	EndSwitch
	;ConsoleWrite($hwnd & @CR)

	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_NOTIFY

Func WM_SYSCOMMAND($hWnd, $iMsg, $iwParam, $ilParam)
	#forceref $hWnd, $iMsg, $iwParam, $ilParam

	Switch $hWnd
		Case $UI_MAIN
			Switch BitAND($iwParam, 0xFFF0)
				Case $SC_CLOSE
					_UI_Terminate()
			EndSwitch
	EndSwitch

	Return $GUI_RUNDEFMSG
EndFunc   ;==>WM_SYSCOMMAND

Func FixIt()
    AdlibUnRegister("FixIt")

	_GUICtrlStatusBar_Resize($hStatusBar)

	Local $WinPos = WinGetPos($UI_MAIN)
	If @error Then Return

	Local $StatusBar_PartsWidth[2] = [$WinPos[2] - 150, -1]
	_GUICtrlStatusBar_SetParts($hStatusBar, $StatusBar_PartsWidth)
    _GUICtrlStatusBar_EmbedControl($hStatusBar, 1, $hProgress)

EndFunc   ;==>FixIt

#endregion - WM_MESSAGES -

#region - IMAGES -

Func Draw($What = 0, $sString = "")
    Local $hGraphic, $hBrush, $hFormat, _
            $hFamily, $hFont, $tLayout, $aInfo, _
            $hBitmap, $FontSize, $iWidth, $iHeight, $fontStyle
	Local $NewImage, $hImage


    Switch $What
		Case $IMAGE_CUSTOM
			Local $ZOOM = 1
			Local $X = _GDIPlus_ImageGetWidth($CurrentImage);*$ZOOM
			Local $Y = _GDIPlus_ImageGetHeight($CurrentImage);*$ZOOM

			$hImage = _GDIPlus_BitmapCreateFromScan0($X, $Y)
			$hGraphic = _GDIPlus_ImageGetGraphicsContext($hImage)

			$hBrush = GdipCreateTexture($CurrentImage,0x00)
			GdipScaleTextureTransform($hBrush,$ZOOM,$ZOOM,0x00)
			GdipRotateTextureTransform($hBrush,$ANGLE,0)
			 _GDIPlus_GraphicsFillRect($hGraphic, 0, 0, $X, $Y, $hBrush)
			$NewImage = _GDIPlus_SaveImageToStream($hImage, 100, "png")

			$CurrentImage = Load_BMP_From_Mem($NewImage)
			;$Angle += 0.01

        Case $IMAGE_RANDOMETEXT; create image with string
			$sString = StringProc($sString, 18)
            $iWidth = Random(400, 500, 1)
            $iHeight = $iWidth
            $FontSize = Random(30, 50, 1)
            $fontStyle = Random(0, 7, 1)

            #region - Create Image Signiture -

            $hImage = _GDIPlus_BitmapCreateFromScan0($iWidth, $iHeight)
            $hGraphic = _GDIPlus_ImageGetGraphicsContext($hImage)
            $hBrush = _GDIPlus_BrushCreateSolid('0xFF' & Hex(Random(0, 255, 1), 2) & Hex(Random(0, 255, 1), 2) & Hex(Random(0, 255, 1), 2))
            _GDIPlus_GraphicsFillRect($hGraphic, 0, 0, $iWidth, $iHeight, $hBrush)
            $hFormat = _GDIPlus_StringFormatCreate()
            $hFamily = _GDIPlus_FontFamilyCreate("consolas")
            $hFont = _GDIPlus_FontCreate($hFamily, $FontSize, $fontStyle)
            $tLayout = _GDIPlus_RectFCreate(10, 10, 0, 0)
            $aInfo = _GDIPlus_GraphicsMeasureString($hGraphic, $sString, $hFont, $tLayout, $hFormat)
            $hBrush = _GDIPlus_BrushCreateSolid('0xFF' & Hex(Random(0, 255, 1), 2) & Hex(Random(0, 255, 1), 2) & Hex(Random(0, 255, 1), 2))
            _GDIPlus_GraphicsDrawStringEx($hGraphic, $sString, $hFont, $aInfo[0], $hFormat, $hBrush)
            $hBitmap = _GDIPlus_BitmapCreateHBITMAPFromBitmap($hImage)
            _WinAPI_DeleteObject($hBitmap)
            _GDIPlus_FontDispose($hFont)
            _GDIPlus_FontFamilyDispose($hFamily)
            _GDIPlus_StringFormatDispose($hFormat)
            _GDIPlus_BrushDispose($hBrush)
            _GDIPlus_GraphicsDispose($hGraphic)
            _GDIPlus_GraphicsDispose($hGraphic)
            $NewImage = _GDIPlus_SaveImageToStream($hImage, 100, "png")
			_GDIPlus_ImageDispose($hImage)
            #endregion - Create Image Signiture -

        Case $IMAGE_CRYINGPONIES; create pony image
            $iWidth = Random(150, 500, 1)
            $iHeight = $iWidth
            Local $hImage1 = _GDIPlus_BitmapCreateFromScan0($iWidth, $iHeight)
            $hGraphic = _GDIPlus_ImageGetGraphicsContext($hImage1)
            $hBrush = _GDIPlus_BrushCreateSolid('0x00000000')
            _GDIPlus_GraphicsFillRect($hGraphic, 0, 0, $iWidth, $iHeight, $hBrush)

            _SetPonyPics()

            Local $hImage2 = Load_BMP_From_Mem(Binary($FlutterShy))
            Local $hImage3 = Load_BMP_From_Mem(Binary($Rarity))
            Local $hImage4 = Load_BMP_From_Mem(Binary($Rainbow))
            Local $hImage5 = Load_BMP_From_Mem(Binary($Twilight))
            Local $hImage6 = Load_BMP_From_Mem(Binary($Pinkie))
            Local $hImage7 = Load_BMP_From_Mem(Binary($Derpy))

            $FlutterShy = 0
            $Rarity = 0
            $Rainbow = 0
            $Twilight = 0
            $Pinkie = 0
            $Derpy = 0

            If Random(1, 2, 1) = 2 Then _GDIPlus_ImageRotateFlip($hImage2, 4)
            If Random(1, 2, 1) = 2 Then _GDIPlus_ImageRotateFlip($hImage3, 4)
            If Random(1, 2, 1) = 2 Then _GDIPlus_ImageRotateFlip($hImage4, 4)
            If Random(1, 2, 1) = 2 Then _GDIPlus_ImageRotateFlip($hImage5, 4)
            If Random(1, 2, 1) = 2 Then _GDIPlus_ImageRotateFlip($hImage6, 4)
            If Random(1, 2, 1) = 2 Then _GDIPlus_ImageRotateFlip($hImage7, 4)

;~ 			$hImage2 = ScaleImage($hImage2, 500, 500, 7)
;~ 			$hImage3 = ScaleImage($hImage3, 500, 500, 7)
;~ 			$hImage4 = ScaleImage($hImage4, 500, 500, 7)
;~ 			$hImage5 = ScaleImage($hImage5, 500, 500, 7)
;~ 			$hImage6 = ScaleImage($hImage6, 500, 500, 7)
;~ 			$hImage7 = ScaleImage($hImage7, 500, 500, 7)

            Local $hGraphics1 = _GDIPlus_ImageGetGraphicsContext($hImage1)

            _GDIPlus_GraphicsDrawImageTrans($hGraphics1, $hImage2, Random(0, $iWidth - 75, 1), Random(0, $iHeight - 75, 1), 1)
            _GDIPlus_GraphicsDrawImageTrans($hGraphics1, $hImage3, Random(0, $iWidth - 75, 1), Random(0, $iHeight - 75, 1), 1)
            _GDIPlus_GraphicsDrawImageTrans($hGraphics1, $hImage4, Random(0, $iWidth - 75, 1), Random(0, $iHeight - 75, 1), 1)
            _GDIPlus_GraphicsDrawImageTrans($hGraphics1, $hImage5, Random(0, $iWidth - 75, 1), Random(0, $iHeight - 75, 1), 1)
            _GDIPlus_GraphicsDrawImageTrans($hGraphics1, $hImage6, Random(0, $iWidth - 75, 1), Random(0, $iHeight - 75, 1), 1)
            _GDIPlus_GraphicsDrawImageTrans($hGraphics1, $hImage7, Random(0, $iWidth - 75, 1), Random(0, $iHeight - 75, 1), 1)

           $NewImage = _GDIPlus_SaveImageToStream($hImage1, 100, "png")

            _GDIPlus_GraphicsDispose($hGraphic)
            _GDIPlus_GraphicsDispose($hGraphics1)
            _GDIPlus_ImageDispose($hImage1)
            _GDIPlus_ImageDispose($hImage2)
            _GDIPlus_ImageDispose($hImage3)
            _GDIPlus_ImageDispose($hImage4)
            _GDIPlus_ImageDispose($hImage5)
            _GDIPlus_ImageDispose($hImage6)
            _GDIPlus_ImageDispose($hImage7)
	EndSwitch

    Return $NewImage
EndFunc   ;==>Draw

Func SetGDIStatus()
	Local $hImage = Load_BMP_From_Mem(_FlutterShyPNG(), True)
	_WinAPI_DeleteObject(GUICtrlSendMsg($GDI_STATUS, 0x0172, 0, $hImage))
EndFunc

Func GdipRotateTextureTransform($hBrush,$Angle,$MatrixOrder=0)
	Local $DLL = "gdiplus.dll"
	Local $RESULT
	$RESULT = DllCall($DLL,"int","GdipRotateTextureTransform","int",$hBrush,"float",$Angle,"int",$MatrixOrder)
EndFunc

Func GdipCreateTexture($hImg,$WrapMode=0x00)
	Local $DLL = "gdiplus.dll"
	Local $RESULT
	$RESULT = DllCall($DLL,"int","GdipCreateTexture","int",$hImg,"int",$WrapMode,"int*",0)
	Return $RESULT[3]
EndFunc

Func GdipScaleTextureTransform($hBrush,$SX,$SY,$MatrixOrder=0x00)
	Local $DLL = "gdiplus.dll"
	Local $RESULT
	$RESULT = DllCall($DLL,"int","GdipScaleTextureTransform","int",$hBrush,"float",$SX,"float",$SY,"int",$MatrixOrder)
EndFunc

Func StringProc($StrIn, $SplitMark)
    Local $StrOut = '', $count, $StrSplit, $StrLen
    $StrSplit = StringSplit($StrIn, @CRLF, 2)
    For $X = 0 To UBound($StrSplit) - 1
        $StrLen = StringLen($StrSplit[$X])
        If $StrLen > 17 Then
            $count = Ceiling(StringLen($StrSplit[$X]) / $SplitMark)
            Local $array[$count + 1], $start = 1
            For $I = 0 To $count
                $array[$I] = StringMid($StrSplit[$X], $start, $SplitMark)
                $start += $SplitMark
            Next
            For $I = 0 To $count
                If $array[$I] = "" Or $array[$I] = " " Then ContinueLoop
                If StringInStr($array[$I], " ", 0, 1, 1, 1) Then
                    $StrOut &= StringReplace(StringReplace(StringReplace($array[$I], @LF, ""), @CR, ""), " ", "", 1, 1) & @LF
                Else
                    $StrOut &= StringReplace(StringReplace($array[$I], @LF, ""), @CR, "") & @LF
                EndIf
            Next
        Else
            If $StrSplit[$X] = "" Then ContinueLoop
            $StrOut &= StringReplace(StringReplace($StrSplit[$X], @LF, ""), @CR, "") & @LF
        EndIf
    Next
    Return $StrOut
EndFunc   ;==>StringProc

Func _GDIPlus_SaveImageToStream($hBitmap, $iQuality = 50, $Encoder = "jpg") ;coded by Andreik, modified by UEZ, FS
    Local $tParams
    Local $tData
    Local $pData
    Local $pParams

    Local $sImgCLSID = _GDIPlus_EncodersGetCLSID($Encoder)
    Local $tGUID = _WinAPI_GUIDFromString($sImgCLSID)
    Local $pEncoder = DllStructGetPtr($tGUID)

    If $Encoder == "jpg" Or $Encoder == "jpeg" Then
        $tParams = _GDIPlus_ParamInit(1)
        $tData = DllStructCreate("int Quality")
        DllStructSetData($tData, "Quality", $iQuality) ;quality 0-100
        $pData = DllStructGetPtr($tData)
        _GDIPlus_ParamAdd($tParams, $GDIP_EPGQUALITY, 1, $GDIP_EPTLONG, $pData)
        $pParams = DllStructGetPtr($tParams)
    Else
        $pParams = 0
    EndIf

    Local $hStream = DllCall("ole32.dll", "uint", "CreateStreamOnHGlobal", "ptr", 0, "bool", True, "ptr*", 0)
    If @error Then Return SetError(1, 0, 0)
    $hStream = $hStream[3]
    DllCall($ghGDIPDll, "uint", "GdipSaveImageToStream", "ptr", $hBitmap, "ptr", $hStream, "ptr", $pEncoder, "ptr", $pParams)
    _GDIPlus_BitmapDispose($hBitmap)
    Local $hMemory = DllCall("ole32.dll", "uint", "GetHGlobalFromStream", "ptr", $hStream, "ptr*", 0)
    If @error Then Return SetError(2, 0, 0)

    $hMemory = $hMemory[2]
    Local $iMemSize = _MemGlobalSize($hMemory)
    Local $pMem = _MemGlobalLock($hMemory)

    $tData = DllStructCreate("byte[" & $iMemSize & "]", $pMem)
    Local $bData = DllStructGetData($tData, 1)
    Local $tVARIANT = DllStructCreate("word vt;word r1;word r2;word r3;ptr data;ptr")

    DllCall("oleaut32.dll", "long", "DispCallFunc", "ptr", $hStream, "dword", 8 + 8 * @AutoItX64, "dword", 4, "dword", 23, "dword", 0, "ptr", 0, "ptr", 0, "ptr", DllStructGetPtr($tVARIANT)) ;http://msdn.microsoft.com/en-us/library/windows/desktop/ms221473(v=vs.85).aspx
    _MemGlobalFree($hMemory)

    Return $bData
EndFunc   ;==>_GDIPlus_SaveImageToStream

;======================================================================================
; Function Name:        Load_BMP_From_Mem
; Description:          Loads an image which is saved as a binary string and converts it to a bitmap or hbitmap
;
; Parameters:           $bImage:        the binary string which contains any valid image which is supported by GDI+
; Optional:                 $hHBITMAP:      if false a bitmap will be created, if true a hbitmap will be created
;
; Remark:                   hbitmap format is used generally for GUI internal images, $bitmap is more a GDI+ image format
;
; Requirement(s):       GDIPlus.au3, Memory.au3 and _GDIPlus_BitmapCreateDIBFromBitmap() from WinAPIEx.au3
; Return Value(s):  Success: handle to bitmap or hbitmap, Error: 0
; Error codes:          1: $bImage is not a binary string
;                               2: unable to create stream on HGlobal
;                               3: unable to create bitmap from stream
;
; Author(s):                UEZ
; Additional Code:  thanks to progandy for the MemGlobalAlloc and tVARIANT lines
; Version:                  v0.97 Build 2012-01-04 Beta
;=======================================================================================
Func Load_BMP_From_Mem($bImage, $hHBITMAP = False)
	If Not IsBinary($bImage) Then Return SetError(1, 0, 0)
	Local $aResult
	Local Const $memBitmap = Binary($bImage) ;load image  saved in variable (memory) and convert it to binary
	Local Const $len = BinaryLen($memBitmap) ;get length of image
	Local Const $hData = _MemGlobalAlloc($len, $GMEM_MOVEABLE) ;allocates movable memory  ($GMEM_MOVEABLE = 0x0002)
	Local Const $pData = _MemGlobalLock($hData) ;translate the handle into a pointer
	Local $tMem = DllStructCreate("byte[" & $len & "]", $pData) ;create struct
	DllStructSetData($tMem, 1, $memBitmap) ;fill struct with image data
	_MemGlobalUnlock($hData) ;decrements the lock count  associated with a memory object that was allocated with GMEM_MOVEABLE
	$aResult = DllCall("ole32.dll", "int", "CreateStreamOnHGlobal", "handle", $pData, "int", True, "ptr*", 0) ;Creates a stream object that uses an HGLOBAL memory handle to store the stream contents
	If @error Then SetError(2, 0, 0)
	Local Const $hStream = $aResult[3]
	$aResult = DllCall($ghGDIPDll, "uint", "GdipCreateBitmapFromStream", "ptr", $hStream, "int*", 0) ;Creates a Bitmap object based on an IStream COM interface
	If @error Then SetError(3, 0, 0)
	Local Const $hBitmap = $aResult[2]
	Local $tVARIANT = DllStructCreate("word vt;word r1;word r2;word r3;ptr data; ptr")
	DllCall("oleaut32.dll", "long", "DispCallFunc", "ptr", $hStream, "dword", 8 + 8 * @AutoItX64, _
			"dword", 4, "dword", 23, "dword", 0, "ptr", 0, "ptr", 0, "ptr", DllStructGetPtr($tVARIANT)) ;release memory from $hStream to avoid memory leak
	$tMem = 0
	$tVARIANT = 0
	If $hHBITMAP Then
		Local Const $hHBmp = _GDIPlus_BitmapCreateDIBFromBitmap($hBitmap)
		_GDIPlus_BitmapDispose($hBitmap)
		Return $hHBmp
	EndIf
	Return $hBitmap
EndFunc   ;==>Load_BMP_From_Mem

Func _GDIPlus_BitmapCreateDIBFromBitmap($hBitmap)
	Local $tBIHDR, $Ret, $tData, $pBits, $hResult = 0
	$Ret = DllCall($ghGDIPDll, 'uint', 'GdipGetImageDimension', 'ptr', $hBitmap, 'float*', 0, 'float*', 0)
	If (@error) Or ($Ret[0]) Then Return 0
	$tData = _GDIPlus_BitmapLockBits($hBitmap, 0, 0, $Ret[2], $Ret[3], $GDIP_ILMREAD, $GDIP_PXF32ARGB)
	$pBits = DllStructGetData($tData, 'Scan0')
	If Not $pBits Then Return 0
	$tBIHDR = DllStructCreate('dword;long;long;ushort;ushort;dword;dword;long;long;dword;dword')
	DllStructSetData($tBIHDR, 1, DllStructGetSize($tBIHDR))
	DllStructSetData($tBIHDR, 2, $Ret[2])
	DllStructSetData($tBIHDR, 3, $Ret[3])
	DllStructSetData($tBIHDR, 4, 1)
	DllStructSetData($tBIHDR, 5, 32)
	DllStructSetData($tBIHDR, 6, 0)
	$hResult = DllCall('gdi32.dll', 'ptr', 'CreateDIBSection', 'hwnd', 0, 'ptr', DllStructGetPtr($tBIHDR), 'uint', 0, 'ptr*', 0, 'ptr', 0, 'dword', 0)
	If (Not @error) And ($hResult[0]) Then
		DllCall('gdi32.dll', 'dword', 'SetBitmapBits', 'ptr', $hResult[0], 'dword', $Ret[2] * $Ret[3] * 4, 'ptr', DllStructGetData($tData, 'Scan0'))
		$hResult = $hResult[0]
	Else
		$hResult = 0
	EndIf
	_GDIPlus_BitmapUnlockBits($hBitmap, $tData)
	Return $hResult
EndFunc   ;==>_GDIPlus_BitmapCreateDIBFromBitmap

;; _GDIPlus_GraphicsDrawImageTrans()
;;      Draw Image object with transparency
Func _GDIPlus_GraphicsDrawImageTrans($hGraphics, $hImage, $iX, $iY, $nTrans)
    Local $tColorMatrix,  $hImgAttrib, $iW = _GDIPlus_ImageGetWidth($hImage), $iH = _GDIPlus_ImageGetHeight($hImage)
;;create color matrix data
    $tColorMatrix = DllStructCreate("float[5];float[5];float[5];float[5];float[5]")
    ;blending values:
    DllStructSetData($tColorMatrix, 1, 1, 1)
	DllStructSetData($tColorMatrix, 2, 1, 2)
	DllStructSetData($tColorMatrix, 3, 1, 3)
	DllStructSetData($tColorMatrix, 4, $nTrans, 4)
	DllStructSetData($tColorMatrix, 5, 1, 5)
    $hImgAttrib = _GDIPlus_ImageAttributesCreate()
    _GDIPlus_ImageAttributesSetColorMatrix($hImgAttrib, 1, DllStructGetPtr($tColorMatrix))
    _GDIPlus_GraphicsDrawImageRectRectEx($hGraphics, $hImage, 0, 0, $iW, $iH, $iX, $iY, $iW, $iH, 2, $hImgAttrib)
    _GDIPlus_ImageAttributesDispose($hImgAttrib)
    Return
EndFunc


;;;;; other GDIPlus wrappers ;;;;;

#cs
_GDIPlus_ImageAttributesSetColorMatrix()
    Sets ColorMatrix of ImageAttributes object
    Parameters:
        $hImgAttrib = ImageAttributes object
        $iColorAdjustType = can be:
            ColorAdjustTypeDefault                =  0
            ColorAdjustTypeBitmap                 =  1
            ColorAdjustTypeBrush                  =  2
            ColorAdjustTypePen                    =  3
            ColorAdjustTypeText                   =  4
            ColorAdjustTypeCount                  =  5
            ColorAdjustTypeAny (Reserved)         =  6
        $pColorMatrix = pointer to ColorMatrix structure
        $pGrayMatrix = pointer to GreyMatrix structure
        $iColorMatrixFlags = can be:
            ColorMatrixFlagsDefault               =  0
            ColorMatrixFlagsSkipGrays             =  1
            ColorMatrixFlagsAltGray               =  2
    Return value: True/False
#ce

;Same as _GDIPlus_GraphicsDrawImageRectRect(), but adds 1 optional parameter - $hImgAttrib (handle to ImageAttributes object)
Func _GDIPlus_GraphicsDrawImageRectRectEx($hGraphics, $hImage, $iSrcX, $iSrcY, $iSrcWidth, $iSrcHeight, $iDstX, $iDstY, $iDstWidth, $iDstHeight, $iUnit = 2, $hImgAttrib = 0)
    Local $aResult = DllCall($ghGDIPDll, "int", "GdipDrawImageRectRectI", "hwnd", $hGraphics, "hwnd", $hImage, "int", $iDstX, "int", _
            $iDstY, "int", $iDstWidth, "int", $iDstHeight, "int", $iSrcX, "int", $iSrcY, "int", $iSrcWidth, "int", _
            $iSrcHeight, "int", $iUnit, "ptr", $hImgAttrib, "int", 0, "int", 0)
    Return SetError($aResult[0], 0, $aResult[0] = 0)
EndFunc

Func ScaleImage($sFile, $iNewWidth, $iNewHeight, $iInterpolationMode = 7) ;coded by UEZ 2012
	;Local $hImage = _GDIPlus_ImageLoadFromFile($sFile)
   ; If @error Then Return SetError(2, 0, 0)
   $hImage = $sFile
    Local $iWidth = _GDIPlus_ImageGetWidth($hImage)
    Local $iHeight = _GDIPlus_ImageGetHeight($hImage)

    Local $iW, $iH, $f, $fRatio

    If $iWidth > $iHeight Then
        $f = $iWidth / $iNewWidth
    Else
        $f = $iHeight / $iNewHeight
    EndIf
    $iW = Int($iWidth / $f)
    $iH = Int($iHeight / $f)

    If $iW > $iNewWidth Then
        $fRatio = $iNewWidth / $iW
        $iW = Int($iW * $fRatio)
        $iH = Int($iH * $fRatio)
    ElseIf $iH > $iNewHeight Then
        $fRatio = $iNewHeight / $iH
        $iW = Int($iW * $fRatio)
        $iH = Int($iH * $fRatio)
    EndIf

    Local $hBitmap = DllCall($ghGDIPDll, "uint", "GdipCreateBitmapFromScan0", "int", $iW, "int", $iH, "int", 0, "int", 0x0026200A, "ptr", 0, "int*", 0)
    If @error Then Return SetError(3, 0, 0)
    $hBitmap = $hBitmap[6]
    Local $hBmpCtxt = _GDIPlus_ImageGetGraphicsContext($hBitmap)
    DllCall($ghGDIPDll, "uint", "GdipSetInterpolationMode", "handle", $hBmpCtxt, "int", $iInterpolationMode)
	;_GDIPLUS_GraphicsSetInterpolationMode($hBmpCtxt, $iInterpolationMode)
    _GDIPlus_GraphicsDrawImageRect($hBmpCtxt, $hImage, 0, 0, $iW, $iH)
    _GDIPlus_ImageDispose($hImage)
    _GDIPlus_GraphicsDispose($hBmpCtxt)
    Return $hBitmap
EndFunc

#endregion - IMAGES -

#region - INTERNAL -

Func _Initialize()
	Opt("GUIOnEventMode", 1)
	;
	If Not _GDIPlus_Startup() Then
		GUICtrlSetState($RADIO_CRYINGPONIES, $GUI_DISABLE)
		GUICtrlSetState($RADIO_CUSTOM, $GUI_DISABLE)
		GUICtrlSetState($RADIO_RANDOM, $GUI_DISABLE)
	Else
		Local $PicPos = ControlGetPos($UI_MAIN, "", $Image)
		Local $hBmp_Empty = _GDIPlus_BitmapCreateFromScan0($PicPos[2], $PicPos[3])
		Local $hCtx_Empty = _GDIPlus_ImageGetGraphicsContext($hBmp_Empty)
		_GDIPlus_GraphicsClear($hCtx_Empty, 0xFFF0F0F0)
		$hHBmp_Empty = _GDIPlus_BitmapCreateHBITMAPFromBitmap($hBmp_Empty)
		_GDIPlus_GraphicsDispose($hCtx_Empty)
		_GDIPlus_BitmapDispose($hBmp_Empty)
		SetGDIStatus()
	EndIf
	_GetNewCaptcha()

	$hStatusBar = _GUICtrlStatusBar_Create($UI_MAIN, -1, "", $SBARS_TOOLTIPS)


    $progress = GUICtrlCreateProgress(0, 0, -1, -1)
    $hProgress = GUICtrlGetHandle($progress)
    _GUICtrlStatusBar_SetMinHeight($hStatusBar, 20)

	FixIt()

	_GUICtrlStatusBar_SetText($hStatusBar, "Thank you for being part of skitty net, enjoy your stay.", 0)

	GUISetState(@SW_SHOW)

	GUIRegisterMsg($WM_COMMAND, "WM_COMMAND")
	GUIRegisterMsg($WM_NOTIFY, "WM_NOTIFY")
	GUIRegisterMsg($WM_SYSCOMMAND, "WM_SYSCOMMAND")

EndFunc   ;==>_Initialize

Func _SaveProxyList()
	Local $GP

	If IsArray($aPROXIES) Then
		For $I = 1 To $aPROXIES[0][0]
			If $aPROXIES[$I][$PROXY_STATS] < $PROXY_FAIL_LIMIT Then
				$GP &= $aPROXIES[$I][$PROXY_STRING] & @CRLF
			EndIf
		Next
		GUICtrlSetData($Console, $GP)
	EndIf

	If FileExists($ProxyList) Then
		Local $Open = FileOpen($ProxyList, 2)
		FileWrite($Open, $GP)
		FileClose($Open)
	Else
		Local $Temp = FileOpenDialog("Select file", "", "All (*.*)",8, "Proxies.txt")
		If Not @error Then
			Local $Open = FileOpen($Temp, 2)
			FileWrite($Open, $GP)
			FileClose($Open)
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: Proxies saved to " & $Temp, 0)
		Else
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: Proxies were not saved...", 0)
		EndIf
	EndIf
EndFunc

Func _LoadProxies()
	Local $IP_ADDRESS_REGEXP = '((?:25[0-5]|2[0-4]\d|1?[1-9]\d?|1\d\d)\.(?:(?:25[0-5]|2[0-4]\d|1?[1-9]\d?|1\d\d|0)\.){2}(?:25[0-5]|2[0-4]\d|1?[1-9]\d?|1\d\d|0):(?:312[8-9]|[1-9]\d{3}|443|1\d{2,3}|8\d|8\d{3}))'
	Local $File = FileOpenDialog("Select file with proxies!", @ScriptDir, "All(*.*)|DataBase(*.db)")
	If @error Or Not FileExists($File) Then Return
	$ProxyList = $File
	Local $source = FileRead($File)
	Local $ProxyFound = StringRegExp($source, $IP_ADDRESS_REGEXP, 3)
	If @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: No proxies found in selected file...", 0)
		Return
	EndIf

	_GUICtrlListView_DeleteAllItems($hProxyListView)

	$aPROXIES = _ArrayUnique($ProxyFound)
	If Not IsArray($aPROXIES) Then
		Dim $aPROXIES[1][9] = [[0,0]]
	Else
		Local $Temp = $aPROXIES
		ReDim $aPROXIES[$Temp[0]+1][9]
		$aPROXIES[0][0] = $Temp[0]
		For $I = 1 To $Temp[0]
			$aPROXIES[$I][$PROXY_STRING] = $Temp[$I]
			$aPROXIES[$I][$PROXY_STATS] = 0
		Next
	EndIf

	For $I = 1 To $aPROXIES[0][0]
		$aPROXIES[$I][$PROXY_HWND] = GUICtrlCreateListViewItem($aPROXIES[$I][$PROXY_STRING], $ProxyListView)
	Next


EndFunc   ;==>_LoadProxies

Func _ExtractMessage($ErrorMessage)
	Local $Temp = $ErrorMessage

	$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?s)<script[^>]*>.*?</script>', '')
	$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?s)<a[^>]*>(.+?)</a>', '$1')

	If StringRegExp($ErrorMessage, "(?i)<title>.*Banned.*</title>") Then
		$ErrorMessage = StringRegExp($ErrorMessage, '(?i)(?s)<img[^>]*>.+(?:your ban.<br/?><br/?>|when your ban has expired.|using the form below.)', 3)
		If Not IsArray($ErrorMessage) Then
			$ErrorMessage = StringRegExp($Temp, '(?i)(?s)<div\s*class="boxcontent"[^>]*>(.+?)</div>', 3); Error Message
			If Not @error And IsArray($ErrorMessage) Then
				If UBound($ErrorMessage) < 1 Then MsgBox(16, "Error 2", "$ErrorMessage is no valid!!!")
				$ErrorMessage = StringRegExpReplace($ErrorMessage[0], '<[^<]*>', '')
			Else
				$ErrorMessage = "Unusable proxy"
				If StringInStr($ErrorMessage, "no entry in our database for your ban.", 2) Then $ErrorMessage = "Probably works"
			EndIf
		Else
			If UBound($ErrorMessage) < 1 Then MsgBox(16, "Error 1", "$ErrorMessage is no valid!!!")
			$ErrorMessage = $ErrorMessage[0]
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?s)<form[^>]*>.*</form>', '')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '<b>([^<]*)</b>(\.?\s?)', '[$1]$2')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '<span\s*\S*class="name">([^<]+)</span>', '[$1]')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '<span\s*\S*class="postertrip">([^<]+)</span>', '[$1]')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '].\s([^\r\n]*)', "]" & @CRLF & '$1')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '<[^<]*>', '')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?i)(?s)Please explain.*questions or updates.', '')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?i)(?s)note:.*\[\]', '')
			$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?:\r\n){2,}', '')

		EndIf
	ElseIf StringRegExp($ErrorMessage, "(?i)<title>.*Verification.*</title>") Then
		Return 'captcha'
	Else
		If StringLen($ErrorMessage) > 30 Then
			$Temp = $ErrorMessage
			$ErrorMessage = StringRegExp($ErrorMessage, '(?i)<span\s*id="errmsg"[^>]*>([^<]*)<', 3); Error Message
			If Not @error And IsArray($ErrorMessage) Then
				If UBound($ErrorMessage) < 1 Then MsgBox(16, "Error 2", "$ErrorMessage is no valid!!!")
				$ErrorMessage = $ErrorMessage[0]
				If StringLen($ErrorMessage) > 100 Then $ErrorMessage = StringLeft($ErrorMessage, 50)
			Else
				$ErrorMessage = "Unable to parse responce, flakey proxy?"
				If StringRegExp($Temp, "(?i)<title>.*Access Restricted.*</title>") And StringInStr($Temp, "virus", 2) Then
					$ErrorMessage = "Banned: Captcha request."
				EndIf
				ConsoleWrite("!!!!!!!>" & $Temp & @CRLF)
			EndIf
		EndIf
	EndIf
	$ErrorMessage = _ConvertEntities($ErrorMessage)
	Return $ErrorMessage
EndFunc   ;==>_ExtractMessage

Func _ConvertEntities($Text)
    Local $aEntities[4][2]=[["&quot;",34],["&amp;",38],["&lt;",60],["&gt;",62]]
    For $x = 0 to Ubound($aEntities)-1
        $Text = StringReplace($Text,$aEntities[$x][0],Chr($aEntities[$x][1]))
    Next
    Return $Text
EndFunc

Func _ProcessResponce($Data, $Index)
	Local $ErrorMessage = _ExtractMessage($Data)

	;ConsoleWrite("+>Extracted Message: " & $ErrorMessage & @CRLF)

	_GUICtrlStatusBar_SetTipText($hStatusBar, 1, "")

	If StringInStr($ErrorMessage, "blocked due to abuse", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Your ISP has been blocked due to abuse...", 0)
		$aPROXIES[$Index][$PROXY_STATS] = 999

	ElseIf StringInStr($ErrorMessage, "post is spam", 2) Then
		$aPROXIES[$Index][$PROXY_STATS] = 0
		GUICtrlSetData($Console, "4chan detected spam, try changing something!!")
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Spam detected. Message: " & $ErrorMessage, 0)

	ElseIf StringInStr($ErrorMessage, "find record", 2) Then
		$aPROXIES[$Index][$PROXY_STATS] = 0
		GUICtrlSetData($Console, "Something is wrong with the image you are posting ;_;!!")

	ElseIf StringInStr($ErrorMessage, "replies has been reached", 2) Then
		$aPROXIES[$Index][$PROXY_STATS] = 0
		GUICtrlSetData($Console, "Max image limit reached!!")

	ElseIf StringInStr($ErrorMessage, "permanently banned", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Proxy has been permanently banned. Message: " & $ErrorMessage, 0)
		_GUICtrlStatusBar_SetTipText($hStatusBar, 0, StringRegExpReplace(StringStripCR($ErrorMessage), "\r?\n", ""))
		$aPROXIES[$Index][$PROXY_STATS] = 999

	ElseIf StringInStr($ErrorMessage, "banned", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Proxy has been banned.", 0)
		$aPROXIES[$Index][$PROXY_STATS] = 999

	ElseIf StringInStr($ErrorMessage, "Restricted", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Proxy returned restricted responce.", 0)
		$aPROXIES[$Index][$PROXY_STATS] += 2

	ElseIf StringInStr($Data, "403 Forbidden", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Proxy returned 403 forbidden responce.", 0)
		$aPROXIES[$Index][$PROXY_STATS] += 2

	ElseIf StringInStr($Data, "Access Denied", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Proxy returned Access Denied responce.", 0)
		$aPROXIES[$Index][$PROXY_STATS] += 2
		_GUICtrlStatusBar_SetText($hStatusBar, "Post successful!!!", 0)

	ElseIf StringInStr($Data, "does not exist", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: thread 404'd.", 0)

	ElseIf StringInStr($Data, "Post successful", 2) Then
		$aPROXIES[$Index][$PROXY_STATS] = 0

	ElseIf StringInStr($ErrorMessage, "wait longer before posting", 2) Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: You must wait longer before you post.", 0)

	Else
		_GUICtrlStatusBar_SetText($hStatusBar, "Error: Proxy returned unkown responce. Message: " & $ErrorMessage, 0)
		_GUICtrlStatusBar_SetTipText($hStatusBar, 0, StringRegExpReplace(StringStripCR($ErrorMessage), "\r?\n", ""))
		$aPROXIES[$Index][$PROXY_STATS] += 1

	EndIf

	Return $ErrorMessage

EndFunc   ;==>_ProcessResponce

Func ClearStatus()
	AdlibUnRegister("ClearStatus")
	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Idle...", 0)
EndFunc

; #FUNCTION# ====================================================================================================================
; Name ..........: _StringRandom
; Description ...: Generates a random alpha or numetric string
; Syntax ........: _StringRandom($Len, $AlphaNum)
; Parameters ....: $Len                 - Length of requested random string.
;                  $AlphaNum            - 0 returns a purly alpha string.
;                                       - 1 returns a alpha numetric string.
; Return values .: a random string
; Author ........: Script Kitty
; ===============================================================================================================================
Func _StringRandom($len, $AlphaNum)
	Local $Boundary
	Switch $AlphaNum
		Case 0
			For $I = 1 To $len
				Switch Random(1, 2, 1)
					Case 1
						$Boundary &= Chr(Random(65, 90, 1))
					Case 2
						$Boundary &= Chr(Random(97, 122, 1))
				EndSwitch
			Next
		Case 1
			For $I = 1 To $len
				Switch Random(1, 3, 1)
					Case 1
						$Boundary &= Chr(Random(65, 90, 1))
					Case 2
						$Boundary &= Chr(Random(48, 57, 1))
					Case 3
						$Boundary &= Chr(Random(97, 122, 1))
				EndSwitch
			Next
	EndSwitch
	Return $Boundary
EndFunc   ;==>_StringRandom

Func _Random()
	Local $char = '', $Rand
	For $X = 1 To 51
		$Rand = Random(2, 6, 1)
		For $Y = 0 To Random(1, 44, 1)
			Switch Random(1, 2, 1)
				Case 0
					$char &= Chr(Random(48, 57, 1))
				Case 1
					$char &= Chr(Random(65, 90, 1))
				Case 2
					$char &= Chr(Random(97, 122, 1))
			EndSwitch
			If (Int(($Y - 1) / $Rand) = (($Y - 1) / $Rand)) Then
				If (Random(0, 1, 1) = 0) Then $char &= Chr(32)
			EndIf
		Next
		$char &= @CRLF
	Next
	Return $char
EndFunc   ;==>_Random

Func _TerminateSession()
	AdlibUnRegister("_TerminateSession")
	If ($_WinHTTP_CurrentSession[0] <> -1) Then
		_WinHttpCloseHandle($_WinHTTP_CurrentSession[0])
		$_WinHTTP_CurrentSession[0] = -1
	EndIf
EndFunc   ;==>_TerminateSession

Func _UI_Terminate()
	_WinAPI_DeleteObject($hHBmp_Empty)
	_GDIPlus_Shutdown()
	_TerminateSession()

	Exit
EndFunc   ;==>_UI_Terminate

Func _GetExitCodeThread($hThread)
	Local $aCall = DllCall($hKERNEL32, 'BOOL', 'GetExitCodeThread', _
			'HANDLE', $hThread, 'DWORD*', 0)
	If @error Or Not $aCall[0] Then Return SetError(1, 0, 0)
	Return $aCall[2]
EndFunc   ;==>_GetExitCodeThread

#endregion - INTERNAL -
