#NoTrayIcon
#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Icon=inc\ico\FavIco.ico
#AutoIt3Wrapper_Outfile=..\BanBuster.exe
#AutoIt3Wrapper_Outfile_x64=..\BanBuster_X64.exe
#AutoIt3Wrapper_Compression=4
#AutoIt3Wrapper_Res_Comment=Remember to read instructions!
#AutoIt3Wrapper_Res_Description=Proxies, get them, test them, use them, ban them.
#AutoIt3Wrapper_Res_Fileversion=4.20
#AutoIt3Wrapper_Res_Fileversion_AutoIncrement=y
#AutoIt3Wrapper_Res_LegalCopyright=ScriptKitty
#AutoIt3Wrapper_Res_Language=1033
#AutoIt3Wrapper_Res_Field=WebSite|http://steamcommunity.com/groups/ponybread
#AutoIt3Wrapper_Res_Field=Contact|SouthSidePonyClick@Gmail.com
#AutoIt3Wrapper_Res_Icon_Add=.\inc\ico\red.ico
#AutoIt3Wrapper_Res_Icon_Add=.\inc\ico\yellow.ico
#AutoIt3Wrapper_Res_Icon_Add=.\inc\ico\green.ico
#AutoIt3Wrapper_Res_File_Add=.\BBLogo.png,10,SPLASH
#AutoIt3Wrapper_Res_File_Add=.\ReadMe.rtf,10,HELP
#AutoIt3Wrapper_Res_File_Add=.\inc\SQLite_LZMA_Compressed.dll,10,SQLITE_DLL
#AutoIt3Wrapper_AU3Check_Parameters=-d -w 1 -w 2 -w 3 -w- 4 -w 5 -w 6 -w- 7
#AutoIt3Wrapper_Run_After=del /f /q "%scriptdir%\%scriptfile%_Obfuscated.au3"
#AutoIt3Wrapper_Run_Obfuscator=y
#Obfuscator_Parameters=/so
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****
#include-once

#CS
	     ___
	 _.-|   |             /\_/,|   (`\
	{   |   |            /o O  |__ _) )
	 "-.|___|         _( y  )  `    /
	  .--'-`-.     _((_ `^--' /_<  \
	.+|______|__.-||__)`-'(((/  (((/

	ScriptKitty
	In memoriam simba 1990-2012
	Special thanks to

	Loves like !1DerpYIZE	: For extensive help with the BanBuster DLL.
	!RAINBOWuMA				: For extensive help in debugging.
	Shiny !hmDRAGoNmM		: For extensive help in debugging.
	MrFreeman !KsSAk/XATI	: For a small change in the WinHTTP code dealing with cloudflare used in Multi-Procesing and some minor bugfixes.

#CE

#CS
	-Some project notes-

	BanBuster was created with the intention to easily search for and use proxies on 4chan.
	Sometimes some people can't change their IP, so I thought this would help, it helped me.

	I've tried to add comments on things to help other understand some of the things going on
	I also try naming functions and variables with sensible names so that common sense can help
	someone understand what it's most likely used for in case there are a lack of comments.
	I've also tried seperating most of the functions into #Region tags to make it easier to
	navigate the project and find things related to whatever problem there might be.

	If something goes wrong with BanBuster sometimes in the future and I (DeputyDerp aka ScriptKitty) am
	not around to deal with it, then I think it will be healpful to know that it's most likely something
	in the "- Internet -" region or "- Proxy Testing Code -". In this particular region, there are functions
	that get data from 4chan, that code region is basically the heart of banbuster and if something is wrong
	with BanBuster.It's probably the way requsts are made to 4chan or the way data is searched for using regexp.
	Or in the case that proxies are never being found or the search feature stopped working, then
	it's a problem with the google search code which should be easy to fix and is all located in the
	internet region.

	Function Callbacks from remote threads do not seem to work, so we used a mailslot method to
	communicate with processes and threads. I think they don't work because the callback can sometimes
	interoupt AutoIt during some important internal stuff and cause access violations.

	- BanBuster.dll -

	BanBuster.dll is a file used to test proxies in threads, before using this file, we used multi-processing
	in order to test proxies, this was a very huge load on the processor and very slow too, but ever since the
	dll was created, testing is pretty fast and barely even uses any CPU whatsoever.
	If using the "Multi-Threading" mode to test proxies does not work, it's most likely something in 4chan that
	has changed, this can probably be fixed from within this script in the "- Proxy Testing Code -" #Region.
	Just look for the structure that is sent to the dll from within the _TestProxyArray() function.
#CE

#include <GUIConstantsEx.au3>
#include <WindowsConstants.au3>
#include <TreeViewConstants.au3>
#include <StaticConstants.au3>
#include <GuiStatusbar.au3>
#include <winapi.au3>
#include <Constants.au3>
#include <GuiMenu.au3>
#include <GuiListView.au3>

#include ".\inc\GuiRichEdit.au3"; slightly modified in order to remove obfuscation code stripping errors/warnings...

#include <ChatRoom.au3>

MutexCheck("BanBuster"); first thing to do is check if we're already running, it's not a good idea to run multiple instances..

OnAutoItExitRegister("Terminate")
FileChangeDir(@ScriptDir); set the directory to where our exe is located in case somehow it was set to somewhere ekse by some unknown anomaly

#region - Initial Global Vars -

Global $Credits = "/B/anBuster is an application created to assist in banevasion on the 4chan.org image board." & _
	"Using this application, a banned user on 4chan will aquire the ability to burn through thousands of proxies, " & _
	"significantly simplifying evasion once the user has learned how to actually use this program effectively. " & _
	"/B/anBuster was created to allow users of the pony /b/reads circlejerk to remain posting after a ban sweep which is quite common " & _
	"in our community on /b/. You might want to know why we do not move or go ""back"" to /mlp/, a ""containment board"" created " & _
	"specifically for the fandome. There are a few reasons, but I will only point out mine, the reason I created this porgram. " & _
	"Fuck the police, break da lawz niggaaaaaaaaa #SWAG " & _
	"""NoHooves/10"" -IGN"

Global $DebugInfo = 0; set this to 1 to create debugging logs, needs much improvment though
Global $ProgressLabel
Global $SQLite_DEBUG = 0;Disable reporting of SQLite error messages, set to 1 to see what happens more closely with the SQLite database

Global $ListISPBans = 0; this variable is user modifyable, will tell the app if user wantes ISP banned proxies showing up, useful for people with 4chan passes

Global $_WinHTTP_CurrentSession[2] = [-1, -1]; winhttp session handling

Global $StopSearch = 0;tells the google search thing to stop searching pages
Global $StopOperation = 0; attempts to stop a function when user requests so
Global $ItemCount; used keep count and inform user of how many proxies are in the list view
Global $hStatusBar; the status bar handle
Global $ListView32; the Autoit list view
Global $SQLite_Message; sqlite error messages
Global $hProxyDataBase = 0; this holds a handle to the proxy database

;~ Global $sMicroSeconds = DllStructCreate("int64 time"); this was used to keep CPU usage to a minimum when getting proxies from the database, but its still very slow so we don't use it anymore, used in SQLite.au3
;~ DllStructSetData($sMicroSeconds, 1, -1000)
;~ Global $MS = DllStructGetPtr($sMicroSeconds, 1);very short sleep calls

; Open handles to DLLs that will be used often throughout banbuster, this makes dll calls a lot faster than just using the name in DllCall()
;Global Const $hNTDLL = DllOpen("ntdll.dll")
Global Const $hMSVCRT = DllOpen("msvcrt.dll"); for the unix timestamp function
Global Const $hKERNEL32 = DllOpen("kernel32.dll")
Global Const $hUSER32 = DllOpen("user32.dll")

; if msvcrt was not loaded, exit because we will not be able to do some important time keeping stuff
; im unsure if this dll can even be missing, but i'm pretty sure if it was, not only banbuster would be effected

If $hMSVCRT = -1 Then Exit MsgBox(16, "Error: Unable To Locate Component", "BanBuster.exe cannot continue execution because ""MSVCRT.DLL"" was not found." & @CR & _
		"DeputyDerp Says: try googling the name of the dll, and get it from somewhere reliable and just copy it to banbusters directory." & @CR & _
		"msvcrt.dll is used to keep some timeing stuff in the database.")

#endregion - Initial Global Vars -

#include ".\inc\ZLIB.au3"; Wards awesom gzip decompressor, used to decompress GZIP data returned from servers in WinHTTP
#include ".\inc\LZMA.au3"; Wards awesom compression library!
#include ".\inc\winhttp.au3"; include only basic things for this area, include UI stuff later
#include ".\inc\sqlite3.au3"; custom SQLite UDF

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

Global $hBanBusterDLL

Local $tURL_COMPONENTS[50], $tOptional[50], $pOptional[50]

Global $aThread[55]; used to hold the thread handles so we can later deal with them
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

#region - UPnP -

Global $UpnpPorts
Global $PortList
Global $MyIPAddress = @IPAddress1
Global $ExternalIP = _GetIP()
Global $ServerStatus = False
Global $ProxyTestPort = 9542

Global $oErrorHandler = ObjEvent("AutoIt.Error", "_ErrFunc")
Global $NATUPnP = ObjCreate("HNetCfg.NATUPnP")
If IsObj($NATUPnP) and Not @error Then
	$ServerStatus = True
	$UpnpPorts = $NATUPnP.StaticPortMappingCollection
	$UpnpPorts.Add($ProxyTestPort, "TCP", $ProxyTestPort, $MyIPAddress, 1, "BanBuster")
EndIf

#endregion - UPnP -

#region - SCRIPT SETTINGS & VAR DATA -

#include <Constants.au3>
#include <GUIConstantsEx.au3>
#include <ComboConstants.au3>
#include <ButtonConstants.au3>
#include <WindowsConstants.au3>

#include <Inet.au3>
#include <crypt.au3>

#include <GuiTab.au3>
#include <GuiListBox.au3>
#include <GuiListView.au3>
#include <GuiStatusBar.au3>

#include <GDIPlus.au3>

#include ".\inc\easytip.au3"; include custom tooltip code
;#include "GDIP.au3"; GDIP for graphics stuff
#include ".\inc\Fonts.au3"; for graphics stuff
#include ".\inc\PredictText.au3"; Auto-Complete, needs serious improvment...

Opt("GUIOnEventMode", 1)

_GDIPlus_Startup(); must startup gdi for splash screen or credits thing

;~ Global $NewBanBusterVersion; this variable will hold the newewst downloaded banbuster version when updating
Global $BanBusterPassword = "NULL"
Global $IntroScreen; used for startup logo
Global $App_Name = StringReplace(StringReplace(@ScriptName, ".au3", ""), ".exe", ""); get file names for the database
Global $ProxyDataBase = @ScriptDir & "\" & $App_Name & " - Proxies.db"
Global $sHistoryDB = @ScriptDir & "\" & $App_Name & " - History.db"
Global $hHistoryDataBase; handle to the history database
$IntroScreen = _Logo_Startup(); startup the logo screen if user runs for the first time

; IP to GEO location
Global $IP2GEODB = @ScriptDir & '\IpToCountry.csv'
Global $IP_ISPDATABASE = @ScriptDir & '\GeoIPASNum2.csv'
Global $IP_BANNEDDB = @ScriptDir & '\bannedips.csv'
Global $IP2GEO_ENABLED = False
Global $IP2GEO_DATA
Global $EnableISPCheck
Global $EnableBannedDB

;Here we have variables to deal with ISP info
Global $ISP_Array; array of ISP info from CSV database
Global $aBANNED_ISPs; the banned ISPs
Global $aBANNED_Countrys; the banned Countrys, venezuela, peru and china are good starters >.>

; User agent that is used on erything except the updating code
Global $UserAgents[] = ["Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1904.0 Safari/537.36", _
						"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.152 Safari/537.22"]
Global $UserAgentString = $UserAgents[Random(0, UBound($UserAgents)-1, 1)]
Global $UserAgentString_backup = $UserAgentString
Global $GoogleBotUserAgent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

; my magic little regexp string
Global $IP_ADDRESS_REGEXP = '((?:25[0-5]|2[0-4]\d|1?[1-9]\d?|1\d\d)\.(?:(?:25[0-5]|2[0-4]\d|1?[1-9]\d?|1\d\d|0)\.){2}(?:25[0-5]|2[0-4]\d|1?[1-9]\d?|1\d\d|0):(?:312[8-9]|[1-9]\d{3}|443|1\d{2,3}|8\d|8\d{3}))'
Global $IP_ADDRESS_REGEXP_BACKUP = $IP_ADDRESS_REGEXP

; these overrides are used with the proxy settings in the registry, just like you'd use them in IE or chrome.
; it might look like a rediculous string for a proxy override, but it's missing things like c, s, y, a, h, n, o, r, g and 4, proxy will only be used on sys.4chan.org and www.4chan.org.
; and proxy will most likely not be used on anything else uless the web address is composed of only the missing letters mentioned above.
; this means proxy will not be used on things like google, yahoo, bing, youtube, mediafire, dropbox, github, msdn, vocaroo, sound cloud etc
Global $ProxyOverRide = "<LOCAL>;content.4chan*;static.4chan*;status.4chan*;*i.4chan*;t.4chan*;*t.4chan*;*.4cdn.*;images.4chan*;boards.4chan*;*.thumbs.4chan*;thumbs.4chan*;api.4chan*;rs.4chan*;" & _
		"*0*;*1*;*2*;*3*;*5*;*6*;*7*;*8*;*9*;*b*;*d*;*e*;*f*;*i*;*j*;*k*;*l*;*m*;*p*;*q*;*t*;*u*;*v*;*x*;*z*;*-*"
Global $ProxyOverRide_backup = $ProxyOverRide

; an array of things that might be in a website returned by google and we'd rather not try scanning unless entered manually
Global $Blacklistedwebsites[14] = [".gov", ".edu", "youtube", "facebook", "yahoo", "Wiki", "Amazon", "PayPal", "stackoverflow", "cnet", "github", "bing", "webcache", "webcache.googleusercontent"]
Global $aIP_Filter

Global $DefaultIPFilter = "110,112,117,120,221,223,121,183,186,190,200,201"; mostly very common venezuelan and chinese proxies..

; timer variable for the SQLite database, we compare times to determin when to delete old things
Global $1_DAY = 86400; one day in seconds, used for timers
Global $PruneEvery = 0;
Global $MAX_GOODLIST = 250; if the database has more than 250 proxies, we trim old ones, this is a user modifiable value

Global $Found = 0; this is incremented to show if proxies were found when scanning
Global $AlreadyExistsCount = 0; how many proxies have been re-found in a list

;SQLite error messages..
Global $aSQLITE_MESSAGES[200]
$aSQLITE_MESSAGES[0] = 'Successful result'
$aSQLITE_MESSAGES[1] = 'SQL error or missing database'
$aSQLITE_MESSAGES[2] = 'An internal logic error in SQLite'
$aSQLITE_MESSAGES[3] = 'Access permission denied'
$aSQLITE_MESSAGES[4] = 'Callback routine requested an abort'
$aSQLITE_MESSAGES[5] = 'The database file is locked'
$aSQLITE_MESSAGES[6] = 'A table in the database is locked'
$aSQLITE_MESSAGES[7] = 'A malloc() failed'
$aSQLITE_MESSAGES[8] = 'Attempt to write a readonly database'
$aSQLITE_MESSAGES[9] = 'Operation terminated by sqlite_interrupt()'
$aSQLITE_MESSAGES[10] = 'Some kind of disk I/O error occurred'
$aSQLITE_MESSAGES[11] = 'The database disk image is malformed'
$aSQLITE_MESSAGES[12] = '(Internal Only) Table or record not found'
$aSQLITE_MESSAGES[13] = 'Insertion failed because database is full'
$aSQLITE_MESSAGES[14] = 'Unable to open the database file'
$aSQLITE_MESSAGES[15] = 'Database lock protocol error'
$aSQLITE_MESSAGES[16] = '(Internal Only) Database table is empty'
$aSQLITE_MESSAGES[17] = 'The database schema changed'
$aSQLITE_MESSAGES[18] = 'Too much data for one row of a table'
$aSQLITE_MESSAGES[19] = 'Abort due to constraint violation'
$aSQLITE_MESSAGES[20] = 'Data type mismatch'
$aSQLITE_MESSAGES[21] = 'Library used incorrectly'
$aSQLITE_MESSAGES[22] = 'Uses OS features not supported on host'
$aSQLITE_MESSAGES[23] = 'Authorization denied'
$aSQLITE_MESSAGES[100] = 'sqlite_step() has another row ready'
$aSQLITE_MESSAGES[101] = 'sqlite_step() has finished executing'

Global $BanCheckResetQue
Global $EnguageBanChecks = False
Global $ChecksInEffect = False
Global $ChecksTimer
Global $aPROXIES[10][10] = [[0,0]]
Global $ProxyIndex = 1
Global $Proxy_Used[2] = [0,0]; used to tell us if a proxy was set and whether we should remove it when a user exits the app
Global $Current_Proxy; used to remember the proxy
Global $Initilize = 1; used to tell us what user actions we should take in the setting reading portion of the script, or something like that...
Global $Crawled = 0; used to tell us when we should skip the "Smart Proxy Test", this happens when a user harvested new proxies
Global $ServersStatus = 0; used to tell us when 4chan is offline or posting is down when user chooses this option
Global $aFilename[1]; used for dropped files

Global $IsInOperation = 0; used by some functions to know whether we should continue execution or not
Global $LastSelectedItem = 0
Global $ISCompiled = @Compiled; sometimes some stuff shouldn't be done when not compiled, this is used to check and not have autoit recurently call this macro when using MP to test proxies

;I think if we change this, the app will go to shit because I sorta nigger rigged everything involving the resizing shit :P lol
Global $GUIMINWID = 461; Resizing / minimum width
Global $GUIMINHT = 278; Resizing / minimum hight

Global $hCurrentUsedProxyEntry; this hold a handle to an old highlighted list view item so that

; this little group is used for the auto complete feature in the searchbar, which is a little buggy
;Global $sPartialData
Global $asKeyWords[1]; array of keywords that you have entered before, like website addresses
Global $iMatch_Count; used for a few things, like determining the size of the list and determining if things were matched
Global $sCurr_Input = "", $sData = "|", $sChosen; these contain text from matches and things like that
Global $iCurrIndex = -1; the index of

;list view stuff
Global $aItemSelected; used for keeping track of the selected item in the list view
Global $ItemSelected = -1, $LastHovered, $iLastsubitemNR = -1; used to manage tooltips
;Global $hWinEventProc = -1; hook windows so we know when ours is deactivated, this way we disable any tooltips that might stay behind
;Global $hWindowsHook = -1
Global $OkForToolTips = True; used to tell the app if it's ok to display the manual tooltips used to display the proxy ban reasons
Global $hBBToolTipControl

Global $UpdateInfo = 0; this is used to get data from another process when an update request was made by the user, typically just return a version number

Global $ThreadNum; the thread number from a board on 4chan, this it set in a function below, just search for the $ThreadNum string in this file
Global $ClipboardActivated = 0; used to tell a function what type of operation to pull off depending on how the user interacted with our app

;captcha stuff
Global $CurrentCaptchaString
Global $IPBANCHECK[1][10] = [[0]]
Global Enum $BAN_IP, $BAN_MESSAGE, $BAN_INPOST, $BAN_STATS, $BAN_COUNTER

Global $FileVersion
If @Compiled Then
	$FileVersion = "v" & FileGetVersion(@ScriptFullPath, "FileVersion")
Else
	$FileVersion = "DevMode"
EndIf

#endregion - SCRIPT SETTINGS & VAR DATA -

#region - GUI -
Global $BANEVADER = GUICreate("/B/anBuster - " & $FileVersion, $GUIMINWID, $GUIMINHT, -1, -1, BitOR($WS_MAXIMIZEBOX, $WS_MINIMIZEBOX, $WS_SIZEBOX, $WS_CAPTION, $WS_POPUP, $WS_SYSMENU), $WS_EX_ACCEPTFILES)
GUISetOnEvent(-3, "Terminate")

GUISetBkColor(0, $BANEVADER); duno why I did this, so I'll just leave it here

Global $Tab1 = GUICtrlCreateTab(0, 0, 463, 257)
GUICtrlSetOnEvent(-1, "CheckTabs")
GUICtrlSetResizing(-1, 102)

GUICtrlCreateTabItem("Proxy Finder")
GUICtrlSetState(-1, $GUI_SHOW)

#region - PROXY FINDER -

Global $SearchBar = GUICtrlCreateInput("", 4, 33, 217, 21)
Global $hSearchBar = GUICtrlGetHandle($SearchBar)
GUICtrlSetState($SearchBar, $GUI_DROPACCEPTED); allow files to be dropped and checked for proxies
Global $SearchBarOffset = 240
;GUICtrlSetResizing(-1, 512 + 32 + 4 + 2)
GuiCtrlSetTip(-1, "Enter a web address with proxies in it, proxies that will be found are in 255.255.255.255:443 format, other formats are not able to be gathered. For this, you can use your own Regular Expression in the settings tab.", "Information", 1, 3)

Global $PageNumbers = GUICtrlCreateInput("1", 230, 34, 33, 21, $ES_READONLY)
GUICtrlSetResizing(-1, 768 + 32 + 4)
GuiCtrlSetTip(-1, "Select how many pages will be searched on Google.", "Information", 1, 3)
GUICtrlCreateUpdown($PageNumbers)
GUICtrlSetLimit(-1, 40, 1)
GuiCtrlSetTip(-1, "Select how many pages will be searched on Google.", "Information", 1, 3)

Global $TimeSetting = GUICtrlCreateCombo("Hour", 268, 34, 65, 25, BitOR($CBS_DROPDOWN, $CBS_AUTOHSCROLL))
GUICtrlSetResizing(-1, 768 + 32 + 4)
GUICtrlSetData(-1, "Day|Week|Month", "Week")
GuiCtrlSetTip(-1, "This is used to tell the app what date relevant results to get from Google!", "Information", 1, 3)

Global $ClipBoard = GUICtrlCreateButton("ClipBoard", 388, 33, 57, 25)
GUICtrlSetResizing(-1, 768 + 32 + 4)
GuiCtrlSetTip(-1, "This will extract proxies from your clipboard aka things you [CTRL]+[C]'d! Best used for HideMyAss.com proxies!", "Information", 1, 3)

Global $SCANBUTTON = GUICtrlCreateButton("Scan", 340, 33, 43, 25)
GUICtrlSetResizing(-1, 768 + 32 + 4)
GuiCtrlSetTip(-1, "To scan a website add ""HTTP://"" to the address!" & @CR & "Anything else will be searched on Google!", "Information", 1, 3)

Global $MaxLevel = 4;GUICtrlCreateCheckbox("Max Level", 141, 76, 97, 17)
;GuiCtrlSetTip(-1, "Maximum level of subdomain recursion.", "Information", 1, 3)

Global $ConsolePlaceHolder = GUICtrlCreateGroup("Info", 4, 65, 449, 185)
GUICtrlSetResizing(-1, 102)
Global $Console = _GUICtrlRichEdit_Create($BANEVADER, "", 16, 88, 1, 1, BitOR($ES_MULTILINE, $WS_VSCROLL, $ES_AUTOVSCROLL, $ES_READONLY), BitOR(0x00000008, 0x00000001))
_GUICtrlRichEdit_SetBkColor($Console, 0x000000)
;~ _GuiCtrlRichEdit_SetEventMask($Console, $ENM_LINK); enable clickable links
;~ _GuiCtrlRichEdit_AutoDetectURL($Console, True)
GUICtrlCreateGroup("", -99, -99, 1, 1)

#endregion - PROXY FINDER -

#region - PROXY TESTER -

Global $TesterTab = GUICtrlCreateTabItem("Proxy Tester")

$ListView32 = GUICtrlCreateListView("Proxy|Latency|GEO|Status|ISP", 4, 25, 454, 196, $LVS_SHOWSELALWAYS)
GUICtrlSetResizing(-1, 102)
_GUICtrlListView_SetExtendedListViewStyle($ListView32, BitOR($LVS_EX_SUBITEMIMAGES, $LVS_EX_FULLROWSELECT));, $LVS_EX_INFOTIP))
Global $hListView32 = GUICtrlGetHandle($ListView32)
_GUICtrlListView_RegisterSortCallBack($hListView32)
GUICtrlSetOnEvent($ListView32, "SortIt")

Global $cMenu = GUICtrlCreateContextMenu($ListView32)
Global $UseProxy = GUICtrlCreateMenuItem("Use Proxy", $cMenu)
Global $RemoveProxy = GUICtrlCreateMenuItem("No Proxy", $cMenu)
GUICtrlCreateMenuItem("", $cMenu)
Global $CopySelected = GUICtrlCreateMenuItem("Copy Selected", $cMenu)
Global $CopyAll = GUICtrlCreateMenuItem("Copy All", $cMenu)
GUICtrlCreateMenuItem("", $cMenu)
Global $ClearProxies = GUICtrlCreateMenuItem("Clear All", $cMenu)
GUICtrlCreateMenuItem("", $cMenu)
Global $DeleteProxySelected = GUICtrlCreateMenuItem("Delete", $cMenu)
Global $DeleteProxyByCountry = GUICtrlCreateMenuItem("Delete by country", $cMenu)
GUICtrlCreateMenuItem("", $cMenu)
Global $BlacklistProxyISP = GUICtrlCreateMenuItem("BlackList by ISP", $cMenu)
Global $BlacklistProxyCountry = GUICtrlCreateMenuItem("BlackList by Country", $cMenu)
GUICtrlCreateMenuItem("", $cMenu)

Global $TestProxy
If $ServerStatus Then
	$TestProxy = GUICtrlCreateMenuItem("Proxy Anonymity", $cMenu)
Else
	$TestProxy = GUICtrlCreateDummy()
EndIf

Global $ActivateProxySettings = GUICtrlCreateMenuItem("Proxy Settings", $cMenu)
Global $ActivateBanChecks = GUICtrlCreateMenuItem("Proxy BanCheck", $cMenu)

DllCall($hUSER32, "lresult", "SendMessage", "hwnd", $hListView32, "uint", 0x1000 + 30, "wparam", 0, "lparam", 150); set width of the columns in the list view
DllCall($hUSER32, "lresult", "SendMessage", "hwnd", $hListView32, "uint", 0x1000 + 30, "wparam", 3, "lparam", 240)

Global $TestButton = GUICtrlCreateButton("Test Proxies", 380, 225, 75, 25)
GUICtrlSetResizing(-1, 768 + 4 + 64)
GuiCtrlSetTip(-1, "Click here to begin testing proxies that you have gathered!", "Information", 1, 3)

Global $RatingView = GUICtrlCreateLabel("", 4, 232, 292, 20)
GUICtrlSetResizing(-1, 768 + 2 + 64)
GUICtrlSetFont(-1, 9, 700)

Global $TestType = GUICtrlCreateCombo("Smart", 310, 225, 65, 25, BitOR($CBS_DROPDOWN,$CBS_AUTOHSCROLL))
GUICtrlSetData(-1, "New|Grave|Dead", "Smart")
GUICtrlSetResizing(-1, 768 + 4 + 64)

GuiCtrlSetTip(-1, "Select the scan type to perform, usually the application manages what test to conduct on its own but you can set them yourself here." & @CRLF & _
	"Smart' will scan proxies that were previusly known to work." & @CRLF & _
	"grave' will test proxies that once worked and stopped or were banned." & @CRLF & _
	"Dead' will test proxies that never responded." & @CRLF & _
	"Banned' will test proxies in the black list, like permabanned proxies.", "Information!", 1, 3)

Global $EnterChat = GUICtrlCreateButton("?", 288, 224, 19, 17)
GUICtrlSetResizing(-1, 768 + 4 + 64)
GuiCtrlSetTip(-1, "If you need help, connect to chat server if it's online..." & @CRLF & "Once you join the server, scriptkitty will be alerted"&@CRLF&"and may or may not join to assist you..", "Info!", 1, 3)

#endregion - PROXY TESTER -

#region - GLOBAL SETTINGS -

GUICtrlCreateTabItem("Settings")

GUICtrlCreateGroup("Spider Settings", 4, 28, 217, 73)
GUICtrlSetResizing(-1, 802)
Global $UseCustomUserAgent = GUICtrlCreateCheckbox("Use custom useragent on web spider", 12, 44, 201, 17)
GuiCtrlSetTip(-1, "The user agent to use for certain things like the web spider. " & @CR & "Don't use something stupid because some sites block them, internet explorer is best option.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
GUICtrlSetOnEvent(-1, "_SET_STATE_UseCustomUserAgent")
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateLabel("User Agent:", 12, 68, 60, 17)
GuiCtrlSetTip(-1, "The user agent to use for certain things like the web spider. " & @CR & "Don't use something stupid because some sites block them, internet explorer is best option.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
Global $CustomUserAgent = GUICtrlCreateInput($UserAgentString, 76, 68, 137, 21)
GuiCtrlSetTip(-1, "The user agent to use for certain things like the web spider. " & @CR & "Don't use something stupid because some sites block them, internet explorer is best option.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)

GUICtrlCreateGroup("IP Regular Expression", 228, 28, 225, 73)
GUICtrlSetResizing(-1, 802)
Global $IPRegExpSetting = GUICtrlCreateCheckbox("Use custom regexp", 236, 44, 121, 17)
GuiCtrlSetTip(-1, "To catch proxies with other ports, just add them seperated by ""|"".", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
GUICtrlSetOnEvent(-1, "_SET_STATE_IPRegExpSetting")

Global $IPRegExp = GUICtrlCreateInput("", 236, 68, 209, 21)
GuiCtrlSetTip(-1, "Please read the ReadMe.txt for more information. This part is important.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("Other Settings", 4, 108, 137, 97); settings area
GUICtrlSetResizing(-1, 802)
Global $SaveBannedISPproxies = GUICtrlCreateCheckbox("Save Banned ISPs", 12, 124, 121, 17)
GuiCtrlSetTip(-1, "Saves all proxies with banned ISPs as if they were good." & @CRLF & "This is useful for when you have a 4chan pass which allows you to bypass this kind of ban.", "Information", 1, 3)
GUICtrlSetResizing(-1, 802)
Global $ShowBanned = GUICtrlCreateCheckbox("Show Ban Messages", 12, 141, 121, 17)
GUICtrlSetResizing(-1, 802)
Global $Rememeber_Items = GUICtrlCreateDummy(); GUICtrlCreateCheckbox("Remember List Proxies", 12, 157, 121, 17)
;~ GUICtrlSetOnEvent(-1, "SessionSave")
;~ GUICtrlSetResizing(-1, 802)
;~ GuiCtrlSetTip(-1, "Saves all proxies tested in the list for the next time you restart banbuster.", "Information", 1, 3)
Global $SkipConnectionChecks = GUICtrlCreateCheckbox("Check 4chan Status", 12, 157, 121, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Enable 4chan connection checking. This will pause the proxy testing operation if 4chan posting is down or if your internet is down.", "Information", 1, 3)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("Proxy Manager", 148, 108, 113, 97)
GUICtrlSetResizing(-1, 802)
Global $PruneProxies = GUICtrlCreateCheckbox("Prune Proxies", 156, 124, 95, 17)
GuiCtrlSetTip(-1, "This option makes the internal proxy manager remove proxies that " & @CR & "have not beem active for the specified time from the database.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
GUICtrlSetOnEvent(-1, "_SET_STATE_PruneProxies")

GUICtrlCreateLabel("After Days  :", 156, 148, 62, 17)
GUICtrlSetResizing(-1, 802)
Global $PruneDays = GUICtrlCreateInput("", 220, 148, 33, 21, 0x2000)
GuiCtrlSetTip(-1, "Prune proxies after (n) days." & @CR & "Proxy will be moved to a lower stage for checking.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
GUICtrlCreateUpdown($PruneDays)
GuiCtrlSetTip(-1, "Prune proxies after (n) days." & @CR & "Proxy will be moved to a lower stage for checking.", "Info!", 1, 3)
GUICtrlSetLimit(-1, 15, 1)

GUICtrlCreateLabel("Prune Start:", 156, 172, 60, 17)
GUICtrlSetResizing(-1, 802)
Global $USER_MAX_LIMIT = GUICtrlCreateInput("", 220, 172, 33, 21, 0x2000)
GuiCtrlSetTip(-1, "Start pruning proxies after (n) proxies have made it into the ""smart test"" operation." & @CR & "Proxy will be moved to a lower stage for checking.", "Info!", 1, 3)
GUICtrlSetResizing(-1, 802)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("DataBase Cleanup", 268, 108, 185, 97)
GUICtrlSetResizing(-1, 802)
Global $ResetProxyDeadlist = GUICtrlCreateButton("Clean Proxy Database", 276, 129, 163, 25)
GUICtrlSetResizing(-1, 802)
Global $ResetGoogleSearchHistory = GUICtrlCreateButton("Clean Google Search History", 276, 161, 163, 25)
GUICtrlSetResizing(-1, 802)
GUICtrlCreateGroup("", -99, -99, 1, 1)

Global $GlobalSettingsSave = GUICtrlCreateButton("Save", 372, 220, 75, 25)
GUICtrlSetResizing(-1, 768 + 64 + 4)

GUICtrlCreateTabItem("")

#endregion - GLOBAL SETTINGS -

#region - Advanced -

GUICtrlCreateTabItem("Advanced")
GUICtrlCreateGroup("Performance", 8, 32, 185, 105)
GUICtrlSetResizing(-1, 802)
GUICtrlCreateLabel("Maximum Connections    :", 16, 48, 124, 17)
GUICtrlSetResizing(-1, 802)
Global $TimeToWait = GUICtrlCreateInput("", 144, 48, 41, 21)
GUICtrlSetResizing(-1, 802)
GUICtrlSetData(-1, 7)
GuiCtrlSetTip(-1, "Select how many proxies are tested at one given time (I.E., 15 will test 15 proxies at the same time).", "Information", 1, 3)
GUICtrlCreateUpdown($TimeToWait)
GUICtrlSetLimit(-1, 25, 1)
GuiCtrlSetTip(-1, "Select how many proxies are tested at one given time (I.E., 15 will test 15 proxies at the same time).", "Information", 1, 3)

GUICtrlCreateLabel("Maximum Test Retries    :", 16, 72, 124, 17)
GUICtrlSetResizing(-1, 802)
Global $MaxRetries = GUICtrlCreateInput("", 144, 72, 41, 21)
GUICtrlSetResizing(-1, 802)
GUICtrlSetData(-1, 3)
GuiCtrlSetTip(-1, "Select how many times a proxy is tested in each thread, lower = faster.", "Information", 1, 3)
GUICtrlCreateUpdown($MaxRetries)
GUICtrlSetLimit(-1, 5, 1)
GuiCtrlSetTip(-1, "Select how many times a proxy is tested in each thread, lower = faster.", "Information", 1, 3)

GUICtrlCreateLabel("Maximum Proxy Latency :", 16, 96, 124, 17)
GUICtrlSetResizing(-1, 802)
Global $MaxTestTime = GUICtrlCreateInput("", 144, 96, 41, 21)
GUICtrlSetResizing(-1, 802)
GUICtrlSetData(-1, 30)
GuiCtrlSetTip(-1, "Select how long a proxy can take to be tested.", "Information", 1, 3)
GUICtrlCreateUpdown($MaxTestTime)
GUICtrlSetLimit(-1, 90, 7)
GuiCtrlSetTip(-1, "Select how long a proxy can take to be tested.", "Information", 1, 3)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("Request Timeouts (MiliSeconds)", 204, 33, 185, 105)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Value in miliseconds to wait for names to be resolved, default is 3000 which is 3 seconds.", "Info!", 1, 3)
GUICtrlCreateLabel("Resolve Timeout      :", 212, 49, 105, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Value in miliseconds to wait for names to be resolved, default is 3000 which is 3 seconds.", "Info!", 1, 3)
Global $ResolveTimeOut = GUICtrlCreateInput("", 324, 49, 57, 21)
GUICtrlSetResizing(-1, 802)

GUICtrlCreateLabel("Connection Timeout :", 212, 73, 105, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Value in miliseconds to wait for the connection to the proxy server to establish, default is 3000 which is 3 seconds.", "Info!", 1, 3)
Global $ConnectTimeOut = GUICtrlCreateInput("", 324, 73, 57, 21)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Value in miliseconds to wait for the connection to the proxy server to establish, default is 3000 which is 3 seconds.", "Info!", 1, 3)

GUICtrlCreateLabel("Response Timeout   :", 212, 97, 105, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Value in miliseconds to wait for the proxy server to respond, default is 2500 which is 2.5 seconds.", "Info!", 1, 3)
Global $ResponseTimeOut = GUICtrlCreateInput("", 324, 97, 57, 21)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Value in miliseconds to wait for the proxy server to respond, default is 2500 which is 2.5 seconds.", "Info!", 1, 3)
GUICtrlCreateGroup("", -99, -99, 1, 1)

Global $GlobalSettingsSave2 = GUICtrlCreateButton("Save", 372, 220, 75, 25)
GUICtrlSetResizing(-1, 768 + 64 + 4)

GUICtrlCreateGroup("Proxy list", 8, 144, 185, 95)
GUICtrlSetResizing(-1, 802)
Global $ShowBannedISPProxies = GUICtrlCreateCheckbox("Show Banned ISPs", 16, 160, 165, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "This will override the program default and display proxies on ISPs you have blacklisted.", "Info!", 1, 3)
Global $ShowBannedCountries = GUICtrlCreateCheckbox("Show Banned Countrys", 16, 176, 165, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "This will override the program default and display proxies from Countries you have blacklisted.", "Info!", 1, 3)
Global $DonttestBannedCountries = GUICtrlCreateCheckbox("Don't test banned Countrys", 16, 192, 165, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Enabling this feature will MASSIVELY decrease testing speeds because the program will have to discover the proxies country BEFORE actually testing the proxy connection!", "WARNING!", 2, 3)
Global $TestBannedPage = GUICtrlCreateCheckbox("Test proxy for bans while using", 16, 208, 165, 17)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "Enabling this feature will cause banbuster to periodically check the banstatus of the selected proxy when you click to use them." & @CRLF & "This feature has an unkown bug that may cause BanBuster to crash randomely.", "WARNING!", 2, 3)
GUICtrlCreateGroup("", -99, -99, 1, 1)

GUICtrlCreateGroup("IP Filter", 204, 145, 185, 41)
GUICtrlSetResizing(-1, 802)
Global $IP_Filter = GUICtrlCreateInput("", 208, 160, 177, 21)
GUICtrlSetResizing(-1, 802)
GuiCtrlSetTip(-1, "A much faster less accurate method of avoiding bad proxies being tested." & @CRLF & "Enter the starting octet of an IP range you want to skip (I.E. 123.xxx.xxx.xxx where ""123"" is the IP range you wish to skip!)." & @CRLF & "Seperate the octets with a comma and no spaces!", "Info!", 1, 3)
GUICtrlCreateGroup("", -99, -99, 1, 1)

#endregion - Advanced -

#region - ABOUT TAB -

#include ".\inc\Splash & Credits Code.au3"; include credits movie code now that all required variables have been created. I'm not even sure how autoit includes stuff though

GUICtrlCreateTabItem("About"); and finally, create the last tab item with information about
GUICtrlCreateLabel("Author   : ScriptKitty/Chance" & @CR & _
		"Web Site : http://steamcommunity.com/groups/ponybread", 10, 30, 450, 50)
GUICtrlSetFont(-1, 9, 600)
GUICtrlCreateLabel("Credits", 10, 70, 350, 45)
GUICtrlSetFont(-1, 17, 600, 2)
GUICtrlCreateLabel("• Loves like !1DerpYIZE" & @CR & _
		"• !RAlNB0WuMA" & @CR & _
		"• Shiny !hmDRAGoNm" & @CR & _
		"• MrFreeman !KsSAk/XATI" & @CR & _
		"• Iza !CaLIntZ666", 10, 100, 380, 180)
GUICtrlSetFont(-1, 15, 400, "", "Ariel")
GUICtrlCreateTabItem("")

#endregion - ABOUT TAB -

#region - STATUS BAR -

$hStatusBar = _GUICtrlStatusBar_Create($BANEVADER)
Global $StatusBar_PartsWidth[3] = [$GUIMINWID - 165, 99999, -1]
_GUICtrlStatusBar_SetParts($hStatusBar, $StatusBar_PartsWidth)
_GUICtrlStatusBar_SetText($hStatusBar, "Status: Initializing...", 0)

#endregion - STATUS BAR -

#region - HISTORY LIST -

Global $hUP = GUICtrlCreateDummy(); this little area allows a user to navigate the search bar dropdown list using the arrow keys
GUICtrlSetOnEvent(-1, "UP")
Global $hDOWN = GUICtrlCreateDummy()
GUICtrlSetOnEvent(-1, "DOWN")
Global $hENTER = GUICtrlCreateDummy()
GUICtrlSetOnEvent(-1, "ENTER")
Global $hDEL = GUICtrlCreateDummy(); allow user to delete item from list view
GUICtrlSetOnEvent(-1, "DELETE")
Global $hHELP = GUICtrlCreateDummy()
GUICtrlSetOnEvent(-1, "HELP")
Global $AccelKeys[5][2] = [["{UP}", $hUP],["{DOWN}", $hDOWN],["{ENTER}", $hENTER],["{DEL}", $hDEL],["{F1}", $hHELP]]
GUISetAccelerators($AccelKeys)

#endregion - HISTORY LIST -

#Region - Child GUIs -

Global $hlist_ui = GUICreate("ListView32", 257, 20, 3, 52, $WS_POPUP, $WS_EX_MDICHILD, $BANEVADER)
Global $hList = GUICtrlCreateList("", 0, 0, 257, 20, BitOR(0x00100000, 0x00200000))
GUICtrlSetOnEvent(-1, "SetListItem")
GUICtrlSetResizing($hList, 1)

Global $ProxySettingsGUI = GUICreate("Proxy Settings", 370, 207, 283, 219, BitOR($WS_CAPTION, $WS_SYSMENU), $WS_EX_DLGMODALFRAME, $BANEVADER)
GUISetOnEvent(-3, "ProxySettingsCloseGUI")
Global $ProxyBlackList = GUICtrlCreateEdit("", 8, 32, 353, 129)
GUICtrlCreateLabel("Access to addresses in this list will be bypassed (I.E., no proxy will be used).", 8, 8, 359, 17)
Global $SettingsSave = GUICtrlCreateButton("Save", 288, 176, 75, 25); save the changes
Global $SettingsRestore = GUICtrlCreateButton("Restore", 208, 176, 75, 25); restore settings if changed

Global $reCaptcha_UI = GUICreate("/B/anBuster - reCaptcha", 301, 81, -1, -1, -1, $WS_EX_MDICHILD, $BANEVADER)
GUISetOnEvent(-3, "_BanCheckUIHide")
Global $reCaptcha = GUICtrlCreatePic("", 0, 0, 300, 57)
Global $reCaptcha_Field = GUICtrlCreateInput("", 0, 60, 300, 21)
Global $hreCaptcha_Field = GUICtrlGetHandle($reCaptcha_Field)

#EndRegion - Child GUIs -

#endregion - GUI -

_Initialize(); main function to setup some stuff and take care of things

While Sleep(10); finally idle by and let things happen
WEnd

#region - Proxy Testing Code -
; this area has most of the code used in testing the proxies

; #FUNCTION# ====================================================================================================================
; Name ..........: MultiThreadedProxyTest
; Description ...: Tests the proxies in the database using multiple threads
; Syntax ........: MultiThreadedProxyTest()
; Parameters ....: None
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; Note To Self...: Remember to implement a method to get thread ID here instead of doing it multiple times in the proxyt test
;                   code used in the file header, this way we prevent unecessary internet activity!
; ===============================================================================================================================
Func MultiThreadedProxyTest()

	;_GUICtrlRichEdit_SetText($Console, "")
	;ConsoleWrite('MultiThreadedProxyTest' & @CR)

	Local $ItemCount, $Proxies, $Rows, $Columns, $SQL_ERR, $ScanIndex
	Local $Tables[5][2] = [["SELECT * FROM topnotch ORDER BY bumped DESC;", "SmartTest"],["SELECT * FROM proxies;", "New proxy check"],["SELECT * FROM graveyard ORDER BY bumped DESC;", "Checking Graveyard"],["SELECT * FROM dead;", "Dead Proxy Check"], ["SELECT * FROM blacklist;", "BlackList Proxy Check"]]

	Local $ComboData = StringLower(GUICtrlRead($TestType))

	If $ComboData == "smart" Then
		$ScanIndex = 0
	ElseIf $ComboData == "new" Then
		$Found = 0
		$ScanIndex = 1
	ElseIf $ComboData == "grave" Then
		$ScanIndex = 2
	ElseIf $ComboData == "dead" Then
		$ScanIndex = 3
		$Tables[$ScanIndex][0] = InputBox("SQLite Query", "SQLite query to used.", $Tables[$ScanIndex][0])
		If @error Then
			Return
		EndIf
	ElseIf $ComboData == "banned" Then
		$ScanIndex = 3
	Else
		_GUICtrlStatusBar_SetText($hStatusBar, "-->Option error...", 0)
		Return
	EndIf


	_GUICtrlStatusBar_SetText($hStatusBar, "Fetching Proxies... ", 0)
	$SQL_ERR = _SQLite_GetTable2d($hProxyDataBase, $Tables[$ScanIndex][0], $Proxies, $Rows, $Columns)
	If $SQL_ERR = $SQLite_OK Then
		;ConsoleWrite("+>" & $Tables[$S][1] & @CR)
		_TestProxyArray($Proxies, $Tables[$ScanIndex][1], $ScanIndex)
	Else
		GUICtrlSetData($TestButton, "Test Proxies")
		_ConsoleWrite('!>SQLite Error: ' & $SQL_ERR & " Message: " & $aSQLITE_MESSAGES[$SQL_ERR] & @CR)
		_GUICtrlStatusBar_SetText($hStatusBar, "SQLite Error: " & $aSQLITE_MESSAGES[$SQL_ERR], 0)
		Return 0
	EndIf

	$Found = 0
	$Proxies = 0
	$ItemCount = _GUICtrlListView_GetItemCount($ListView32)
	_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & $ItemCount, 1)
	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Testing operation compleated!", 0)

	Return 1
EndFunc   ;==>MultiThreadedProxyTest

Func _TestProxyArray($Proxies, $TableName, $Level)

	Local $skipconCheck = (GUICtrlRead($SkipConnectionChecks) = 4)
	If $skipconCheck Then $ServersStatus = 1

	Local $CheckIntervail = 1000

	;$ThreadNum = _GetNewThreadID($ThreadNum)
	;If @error Then MsgBox(16, "Error: " & @error, "Unable to retrieve thread for testing!")

	Local $ContentType = "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" & @CRLF & _
			"Cache-Control: max-age=0" & @CRLF & _
			"Content-Type: application/x-www-form-urlencoded" & @CRLF & _
			"Origin: https://boards.4chan.org" & @CRLF & _
			"Referer: https://sys.4chan.org/b/" & @CRLF & _
			"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF & _
			"Accept-Language: en-US,en;q=0.8" & @CRLF & _
			"Accept-Encoding: *;q=0" & @CRLF

	Local $sOptional, $iOptional, $ThreadStatus
	Local $DoChecks
	Local $index, $Time
	Local $PullOut
	Local $Hits = 0
	Local $HitsMax = 2
	Local $LastOctets

	_SQLITE_LOCK(1)

	Local $RESPONSE_TIMEOUT = GUICtrlRead($ResponseTimeOut)
	Local $RESOLVE_TIMEOUT = GUICtrlRead($ResolveTimeOut)
	Local $CONNECT_TIMEOUT = GUICtrlRead($ConnectTimeOut)

	Local $ProxyCount = UBound($Proxies) - 1

	;Local $DBG = FileOpen(@ScriptDir & "\dgb.exe", 1)

	For $X = 1 To $ProxyCount

		If $Proxies[$X][0] = $LastOctets Then
			If $Hits > $HitsMax Then

				$LastOctets = $Proxies[$X][0]
				$Hits += 1

				_GUICtrlStatusBar_SetText($hStatusBar, $TableName & ": blacklisting = (" & $Proxies[$X][0] & ")", 0)
				_GUICtrlStatusBar_SetText($hStatusBar, "Testing: " & $X & " Of " & $ProxyCount, 1)

				_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxies[$X][0] & "';")
				_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxies[$X][0] & "';")
				_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxies[$X][0] & "';")
				_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxies[$X][0] & "';")
				_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxies[$X][0] & "';")

				_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $Proxies[$X][0] & "','"& $Proxies[$X][1] & "');")

				ContinueLoop

			Else
				$Hits += 1
			EndIf
		Else
			$LastOctets = $Proxies[$X][0]
			$Hits = 0
		EndIf

		If ($CheckIntervail < TimerDiff($ChecksTimer)) Then
			ToolTipsManager()
			If $EnguageBanChecks Then _Proxy_BanPage_Check()
			$ChecksTimer = TimerInit()
		EndIf

		$DoChecks = (Int(($X - 1) / 200) = ($X - 1) / 200)
		If Not $skipconCheck Then
			If $DoChecks Then PingSys()
		EndIf

		;FileWrite($DBG, "1")

		If $aIP_Filter[0] And $aIP_Filter[1] Then
			For $octet = 1 to $aIP_Filter[0]
				If StringSplit($Proxies[$X][0], ".")[1] == $aIP_Filter[$octet] Then
					_GUICtrlStatusBar_SetText($hStatusBar, $TableName & ": blacklisting = (" & $Proxies[$X][0] & ")", 0)
;~ 					If $SQLITE_OK <> _SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxies[$X][0] & "';") Then
;~ 						_ConsoleWrite("!->SQLite Error: " & @error & @CR & ">Message: " & $aSQLITE_MESSAGES[_SQLite_ErrCode($hProxyDataBase)] & @CR)
;~ 					EndIf

					_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxies[$X][0] & "';")
					_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxies[$X][0] & "';")
					_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxies[$X][0] & "';")
					_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxies[$X][0] & "';")
					_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxies[$X][0] & "';")

					_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $Proxies[$X][0] & "','"& $Proxies[$X][1] & "');")
					ContinueLoop 2
				EndIf
			Next
		EndIf

		_GUICtrlStatusBar_SetText($hStatusBar, $TableName & ": " & $Proxies[$X][0] & ":" & $Proxies[$X][1], 0)
		_GUICtrlStatusBar_SetText($hStatusBar, "Testing: " & $X & " Of " & $ProxyCount, 1)

		If GUICtrlRead($DonttestBannedCountries) = $GUI_CHECKED Then
			If IsCountryBanned(_Proxy_Get_Country($Proxies[$X][0])) Then ContinueLoop
		EndIf

		;FileWrite($DBG, "2")

		If $DoChecks Then
			$ThreadNum = _GetNewThreadID($ThreadNum); get a new thread on front page in case of 404
			If Not $ThreadNum Then
				For $k = 0 To 15
					_GUICtrlStatusBar_SetText($hStatusBar, "Status: Connection failure, retrying to retrieve a test thread ID...", 0)
					$ThreadNum = _GetNewThreadID($ThreadNum); get a new thread on front page in case of 404
					If $ThreadNum Then ExitLoop
					Sleep(30000)

				Next
				_GUICtrlStatusBar_SetText($hStatusBar, "Operation failure: Unable to obtain test thread ID.", 0)
				_ConsoleWrite("!->Proxy tests have been aborted because obtaining a test thread ID resulted in a failure." & @CR)
				$StopOperation = 1

			EndIf
		EndIf

		;FileWrite($DBG, "3")

		If $StopOperation Then
			$ItemCount = _GUICtrlListView_GetItemCount($ListView32)
			$Proxies = 0
			If ($Level = 1) Then $Found = 0
			;ConsoleWrite("$StopOperation = 1" & @CR)
			ExitLoop
		ElseIf $ServersStatus = 0 Then
			_ConsoleWrite("!>" & @YEAR & "/" & @MON & "/" & @MDAY & " " & @HOUR & ":" & @MIN & "." & @SEC & " - Connection failure: Cannot connect to sys.4chan.org, retrying to connect..." & @CR)

			For $L = 1 To 250
				PingSys()
				If Not ($ServersStatus) And Not ($StopOperation) Then
					For $T = 15 To 1 Step -1
						ToolTipsManager()
						Sleep(1000)
						_GUICtrlStatusBar_SetText($hStatusBar, "Status: Connection failure, retrying in " & $T & " seconds...", 0)
					Next
				Else
					ExitLoop
				EndIf
				Sleep(1000)
			Next
		EndIf

		;FileWrite($DBG, "4")

		#region - Fill Test Pool -

		For $I = 0 To 99999999999; cycle through array until index is available for new thread
			; $i should not be used, use $Index instead so we don't get a subscript error or out of bounds error with arrays
			$index = Mod($I, Number(GUICtrlRead($TimeToWait))); cycle through 0 to max number of threads user requests

			If VarGetType($index) <> 'int32' Then $index = 0; <> defaults to a case insensitive string comparison I belive

			Sleep(1); very short sleep

			$ThreadStatus = _GetExitCodeThread($aThread[$index])

			;FileWrite($DBG, "5")

			If $ThreadStatus = $EXITCODE_RUNNING Then ContinueLoop; thread hasn't exited, so skip this index

			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxies[$X][0] & "';")

			If Not Int($Proxies[$X][0]) Then; somewhere in this script, 0's are being added to the database every once in a blue moon, filter that shit out :(
				ContinueLoop 2
			EndIf

			;FileWrite($DBG, "6")

			DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aThread[$index], 'DWORD*', 0); terminate thread just in case
			DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $aThread[$index]); handles seem to be left open, rewriting them doesn't close them

			;FileWrite($DBG, "7")

;~ 			ConsoleWrite("Proxy: " & DllStructGetData($tURL_COMPONENTS[$index], "Proxy") & @CR)
;~ 			ConsoleWrite(DllStructGetData($tURL_COMPONENTS[$index], "ResponceHTML") & @CR)
;~ 			ConsoleWrite(DllStructGetData($tURL_COMPONENTS[$index], "ResponceHeaders") & @CR & @CR)

			If IsDllStruct($tURL_COMPONENTS[$index]) Then

				;_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$index], "httpRequest"))
				;_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$index], "httpConnect"))
				;_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$index], "httpSession"))

				;FileWrite($DBG, "7")

				_ProcessResponce( _
						DllStructGetData($tURL_COMPONENTS[$index], "ResponceHTML"), _
						DllStructGetData($tURL_COMPONENTS[$index], "Proxy"), _
						DllStructGetData($tURL_COMPONENTS[$index], "Latency"), _
						GUICtrlRead($ShowBanned), _
						$Level, _
						$tURL_COMPONENTS[$index] _
						)

						;FileWrite($DBG, "8")

			EndIf

			$tURL_COMPONENTS[$index] = 0; destroy any old structures
			$tOptional[$index] = 0

			;FileWrite($DBG, "9")

			#region - Thread Parameters -

			$tURL_COMPONENTS[$index] = DllStructCreate($tagTHREAD_PARAMETERS)

			;FileWrite($DBG, "9")

			; paramteres are
			$sOptional = $ThreadNum & "=delete&mode=usrdel&pwd=" & _StringRandom(Random(3, 7, 1), 1) ; parameters for the POST
			$iOptional = BinaryLen($sOptional) + 5 ; lenght of parameters
			$tOptional[$index] = DllStructCreate("byte[" & $iOptional & "]") ; prepare structure for parameters
			$pOptional[$index] = DllStructGetPtr($tOptional[$index]) ; get pointer
			DllStructSetData($tOptional[$index], 1, $sOptional) ; set data

			; I'm not sure but I think using numbers instead of names are faster, so I'll stick with that
			DllStructSetData($tURL_COMPONENTS[$index], "UserAgent", $UserAgentString)
			DllStructSetData($tURL_COMPONENTS[$index], "HTTPVerb", "POST")
			DllStructSetData($tURL_COMPONENTS[$index], "Host", "sys.4chan.org")
			DllStructSetData($tURL_COMPONENTS[$index], "Resource", "b/imgboard.php?")
			DllStructSetData($tURL_COMPONENTS[$index], "Port", $INTERNET_DEFAULT_HTTPS_PORT)

			DllStructSetData($tURL_COMPONENTS[$index], "Referer", '')
			DllStructSetData($tURL_COMPONENTS[$index], "Headers", $ContentType)
			DllStructSetData($tURL_COMPONENTS[$index], "ExtraData", $pOptional[$index])

			DllStructSetData($tURL_COMPONENTS[$index], "Length", $iOptional)
			DllStructSetData($tURL_COMPONENTS[$index], "TotalLength", $iOptional)

			DllStructSetData($tURL_COMPONENTS[$index], "dwResolveTimeout", $RESOLVE_TIMEOUT)
			DllStructSetData($tURL_COMPONENTS[$index], "dwConnectTimeout", $CONNECT_TIMEOUT)
			DllStructSetData($tURL_COMPONENTS[$index], "dwSendTimeout", 15000) ; 15 seconds
			DllStructSetData($tURL_COMPONENTS[$index], "dwReceiveTimeout", $RESPONSE_TIMEOUT)

			DllStructSetData($tURL_COMPONENTS[$index], "Proxy", $Proxies[$X][0] & ":" & $Proxies[$X][1])
			DllStructSetData($tURL_COMPONENTS[$index], "ProxyFlags", $WINHTTP_ACCESS_TYPE_NAMED_PROXY)
			DllStructSetData($tURL_COMPONENTS[$index], "SendFlags", BitOR($WINHTTP_FLAG_SECURE, $WINHTTP_FLAG_ESCAPE_DISABLE))

			DllStructSetData($tURL_COMPONENTS[$index], "RetryTimes", GUICtrlRead($MaxRetries))
			DllStructSetData($tURL_COMPONENTS[$index], "MaxTestTime", GUICtrlRead($MaxTestTime))

			;FileWrite($DBG, "10")

			#endregion - Thread Parameters -

			; finally. create the thread and send it the structure and tell it what type of method to use
			;FileWrite(".\Added.txt", @HOUR & ":" & @MIN & ":" & @SEC & ":" & @MSEC & @TAB & "ScanLevel (" & $Level & ")" & @TAB & @TAB & "IP (" & $Proxies[$X][1] & ")" & @CRLF)
			$aThread[$index] = CheckProxyInAnotherThread(DllStructGetPtr($tURL_COMPONENTS[$index]))
			If @error Then ConsoleWrite("!>TreadError: " & @error & @CR)
			;FileWrite($DBG, "11")
			;ConsoleWrite($x & ") Added: " & $Proxies[$X][1] & @TAB & @TAB & "into index: " & $index & @CR)

			_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxies[$X][0] & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxies[$X][0] & "';")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO dead (proxy) VALUES ('" & $Proxies[$X][0] & "','" & $Proxies[$X][1] & "');")

			;FileWrite($DBG, "12")

			ExitLoop; exit this loop so we get a new proxy to add to the test pool

		Next

		;FileWrite($DBG, "13")

		#endregion - Fill Test Pool -

	Next

	;FileClose($DBG)

	$Time = TimerInit()
	For $X = 0 To 10e+100

		$PullOut = True

		For $I = 0 To UBound($aThread) - 1
			Sleep(10)
			$ThreadStatus = _GetExitCodeThread($aThread[$I])

			If $ThreadStatus = $EXITCODE_RUNNING Then
				$PullOut = False
				ContinueLoop
			EndIf

		Next

		If $PullOut Or (TimerDiff($Time) > 15000) Then
		;If $PullOut Then

			For $I = 0 To UBound($aThread) - 1
				DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aThread[$I], 'DWORD*', 0)
				DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $aThread[$I])
			Next

			For $I = 0 To UBound($tURL_COMPONENTS) - 1
				If IsDllStruct($tURL_COMPONENTS[$I]) Then

					_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$I], "httpRequest"))
					_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$I], "httpConnect"))
					_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$I], "httpSession"))

					If StringLen(DllStructGetData($tURL_COMPONENTS[$I], "ResponceHTML")) > 300 Then
						_ProcessResponce( _
								DllStructGetData($tURL_COMPONENTS[$I], "ResponceHTML"), _
								DllStructGetData($tURL_COMPONENTS[$I], "Proxy"), _
								DllStructGetData($tURL_COMPONENTS[$I], "Latency"), _
								GUICtrlRead($ShowBanned), _
								$Level, _
								$tURL_COMPONENTS[$I] _
								)
					EndIf
				EndIf
			Next

			ExitLoop
		EndIf

		Sleep(10)

	Next

	For $I = 0 To UBound($tURL_COMPONENTS) - 1
		If IsDllStruct($tURL_COMPONENTS[$I]) Then

			_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$I], "httpRequest"))
			_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$I], "httpConnect"))
			_WinHttpCloseHandle(DllStructGetData($tURL_COMPONENTS[$I], "httpSession"))

		EndIf
	Next

	For $I = 0 To UBound($aThread) - 1
		DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aThread[$I], 'DWORD*', 0)
		DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $aThread[$I])
	Next

	$Time = 0

	_SQLITE_LOCK(0)

EndFunc   ;==>_TestProxyArray

; this is used with BanBuster.dll to create proxy testing threads
Func CheckProxyInAnotherThread($param)
	Local $aCall = DllCall($hBanBusterDLL, 'HANDLE', 'WinHTTP_Action', 'ptr', $param)
	If @error Then
		ConsoleWrite("!>ERROR: " & @error & @CR)
		Return SetError(2, 0, 0)
	EndIf
	If Not IsArray($aCall) Then MsgBox(16, "Error", "Impending crash, $aCall is not an array!!!")
	If $aCall[0] = 0 Then Return SetError(3, 0, 0)
	Return SetError(0, 0 ,$aCall[0]); $aRet
EndFunc   ;==>CheckProxyInAnotherThread

Func _ProcessResponce($Data, $IP, $Time, $ListWhat, $ScanLevel, $StrucData)
	;ConsoleWrite($Data & @CRLF)
	Local $ErrorMessage = _ExtractMessage($Data)
	Local Enum $SMART_SCAN = 0, $NEW_PROXY_SCAN, $GRAVEYARD_SCAN, $DEAD_SCAN
	Local $BumpTime = DllCall($hMSVCRT, "int:cdecl", "time", "int", 0)

	Local $Split = StringSplit($IP, ":")
	Local $Port = $Split[2], $proxy = $Split[1], $aData, $Msg

;~ 	FileWrite(".\Processed.txt", @HOUR & ":" & @MIN & ":" & @SEC & ":" & @MSEC & @TAB & "ScanLevel (" & $ScanLevel & ")" & @TAB & @TAB & "IP (" & $IP & ")" & @TAB & @TAB & "Time (" & $Time & ")" & @CRLF & _
;~ 	"ErrorMessage: "& $ErrorMessage & @CRLF & _
;~ 	"#####################################################HTML##############################################################" & @CRLF & $Data & @CRLF & _
;~ 	"#####################################################HTML##############################################################" & @CRLF & @CRLF)

	If StringInStr($Data, "Password incorrect", 2) Or _
		StringInStr($Data, "a post this old", 2) Or _
		(StringInStr($ErrorMessage, "blocked due to abuse", 2) And $ListISPBans) Then
		;MsgBox(0, "Saved", $ErrorMessage)

		$Msg = "You must solve the CAPTCHA in order to view your IP's ban status."

		$aData = _AddItemToListView($proxy, $Port, $Time, "", $Msg)
		If @error = 1 Then
			_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")

			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $proxy & "';")
		Else
			_SQLite_Exec($hProxyDataBase, "INSERT INTO topnotch 	 (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $aData[0] & "','" & $aData[1] & "','" & $aData[2] & "','" & $aData[3] & "'," & _SQLite_Escape($aData[4]) & "," & _SQLite_Escape($aData[5]) & "," & $BumpTime[0] & ");")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO listviewitems (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $aData[0] & "','" & $aData[1] & "','" & $aData[2] & "','" & $aData[3] & "'," & _SQLite_Escape($aData[4]) & "," & _SQLite_Escape($aData[5]) & "," & $BumpTime[0] & ");")
			If @error Then ConsoleWrite("ERROR: " & @error & @CR)

			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $proxy & "';")
		EndIf

	ElseIf StringInStr($Data, "permanently banned", 2) Or (StringInStr($ErrorMessage, "blocked due to abuse", 2) And Not $ListISPBans) Then;
		;MsgBox(0, "Not Saved", $ErrorMessage)
		_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")

		_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $proxy & "';")

		If $ListWhat = 1 Then
			$aData = _AddItemToListView($proxy, $Port, $Time, "", $ErrorMessage)
			_SQLite_Exec($hProxyDataBase, "INSERT INTO listviewitems (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $aData[0] & "','" & $aData[1] & "','" & $aData[2] & "','" & $aData[3] & "'," & _SQLite_Escape($aData[4]) & "," & _SQLite_Escape($aData[5]) & "," & $BumpTime[0] & ");")
		EndIf

	ElseIf StringInStr($Data, "banned", 2) And Not StringInStr($ErrorMessage, "Restricted", 2) Then

		_SQLite_Exec($hProxyDataBase, "INSERT INTO graveyard (proxy,bumped) VALUES ('" & $proxy & "','" & $BumpTime[0] & "');")

		_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM blacklist WHERE proxy='" & $proxy & "';")

		If $ListWhat = 1 Then
			$aData = _AddItemToListView($proxy, $Port, $Time, "", $ErrorMessage)
			_SQLite_Exec($hProxyDataBase, "INSERT INTO listviewitems (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $aData[0] & "','" & $aData[1] & "','" & $aData[2] & "','" & $aData[3] & "'," & _SQLite_Escape($aData[4]) & "," & _SQLite_Escape($aData[5]) & "," & $BumpTime[0] & ");")
		EndIf

	ElseIf StringInStr($Data, "403 Forbidden", 2) Or StringInStr($Data, "Access Denied", 2) Or StringInStr($ErrorMessage, "Restricted", 2) Then

		_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")

		_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $proxy & "';")

	Else
		Switch $ScanLevel
			Case $SMART_SCAN
				;_SQLite_Exec($hProxyDataBase, "INSERT INTO graveyard (proxy, port, bumped) VALUES ('" & $proxy & "','" & $Port & "','" & $BumpTime[0] & "');")
			Case $NEW_PROXY_SCAN
				_SQLite_Exec($hProxyDataBase, "INSERT INTO dead (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")
			Case $GRAVEYARD_SCAN
				; this is AutoManaged at application exit
			Case $DEAD_SCAN
				; do nothing
		EndSwitch

		If $ListWhat = 1 Then
			If (DllStructGetData($StrucData, "ResponceHTML")) > 10 Then
				$aData = _AddItemToListView($proxy, $Port, $Time, "", "Error with proxy or access denied!")
				_SQLite_Exec($hProxyDataBase, "INSERT INTO listviewitems (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $aData[0] & "','" & $aData[1] & "','" & $aData[2] & "','" & $aData[3] & "'," & _SQLite_Escape($aData[4]) & "," & _SQLite_Escape($aData[5]) & "," & $BumpTime[0] & ");")
			EndIf
		EndIf

	EndIf
	Return $ErrorMessage
EndFunc   ;==>_ProcessResponce

Func _ExtractMessage($ErrorMessage)
	Local $Temp = $ErrorMessage
	If StringRegExp($ErrorMessage, "(?i)<title>.*Banned.*</title>") Then

		$ErrorMessage = StringRegExpReplace($ErrorMessage, '(?s)<script[^>]*>.*?</script>', '')
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
			EndIf
		EndIf
	EndIf
	$ErrorMessage = _ConvertEntities($ErrorMessage)
	Return $ErrorMessage
EndFunc   ;==>_ExtractMessage

; #FUNCTION# =====================================================================================================================
; Description ...: _ConvertEntities
; Parameters ....: $sURL - IN - The Text to convert
; Return values .: Success - Converted string
; Author ........: Stephen Podhajecki {gehossafats at netmdc. com}
; Remarks .......: Replaces HTML escape sequences with character representation
;                  Based on information found here: http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php
;                  nbsp is changed to 32 instead of 160
; Related .......:
; ================================================================================================================================
Func _ConvertEntities($Text)
    Local $aEntities[4][2]=[["&quot;",34],["&amp;",38],["&lt;",60],["&gt;",62]]
    For $x = 0 to Ubound($aEntities)-1
        $Text = StringReplace($Text,$aEntities[$x][0],Chr($aEntities[$x][1]))
    Next
    Return $Text
EndFunc

Func _AddItemToListView($IP, $Port, $Latancy, $Geo, $Msg, $ISP = "", $Init = 0)
	If (StringLen($IP) < 6) Or (StringLen($Port) <= 1) Then
		Local $dummy[6]
		Return $dummy
	EndIf

	If Not $Geo Then
		$Geo = "N/A"
		If $IP2GEO_ENABLED Then $Geo = _Proxy_Get_Country($IP)
	EndIf

	Local $h
	Local $ISPFound
	Local $IsCountryBan
	Local $Red = 0xFFD1D1, $Yellow = 0xFFFBD1, $Green = 0xD1FFD3, $Violet = 0xCF70FF

	If $Init Then
		If $ISP <> "N/A" Then $ISPFound = True
	Else
		If Not $ISP Or $ISP = "N/A" Then
			$ISP = ProxyGetISP($IP)
			If Not @error Then
				$ISPFound = True
			Else
				$ISP = "N/A"
			EndIf
		Else
			If $ISP <> "N/A" Then $ISPFound = True
		EndIf

		$IsCountryBan = IsCountryBanned($Geo); set wheather to show or not show these proxies
	EndIf

	Local $Return[6] = [$IP, $Port, $Latancy, $Geo, $Msg, $ISP]

	If (GUICtrlRead($ShowBannedCountries) = $GUI_UNCHECKED) And $IsCountryBan = True Then
		Return $Return
	EndIf

	$IP &= ":" & $Port; add port value

	If Not $ISPFound Then
		$h = GUICtrlCreateListViewItem($IP & "|" & $Latancy & "|" & $Geo & "|" & $Msg & "|N/A", $ListView32)
		GUICtrlSetBkColor($h, $Yellow)
	Else
		Switch IsISPBanned($ISP)
			Case True
				If GUICtrlRead($ShowBannedISPProxies) = $GUI_UNCHECKED Then
					Local $dummy[6]
					Return SetError(1, 0, $dummy)
				EndIf
				$h = GUICtrlCreateListViewItem($IP & "|" & $Latancy & "|" & $Geo & "|" & $Msg & "|"& StringRegExpReplace($ISP, "AS\d{1,}\h",""), $ListView32)
				GUICtrlSetBkColor($h, $Red)
			Case False
				$h = GUICtrlCreateListViewItem($IP & "|" & $Latancy & "|" & $Geo & "|" & $Msg & "|" & StringRegExpReplace($ISP, "AS\d{1,}\h",""), $ListView32)
				GUICtrlSetBkColor($h, $Green)
		EndSwitch
	EndIf

	If $IsCountryBan Then
		GUICtrlSetBkColor($h, $Violet)
	EndIf

	Local $Case1, $Case2, $Case3

	$Case1 = $Latancy < 3
	$Case2 = ($Latancy > 3 And $Latancy < 6) Or ($Latancy = 3 Or $Latancy = 6)
	$Case3 = $Latancy > 6

	Select
		Case $Case1
			If $ISCompiled Then
				GUICtrlSetImage($h, @ScriptFullPath, 203, 0)
			Else
				GUICtrlSetImage($h, @ScriptDir & "\inc\ico\green.ico")
			EndIf

		Case $Case2
			If $ISCompiled Then
				GUICtrlSetImage($h, @ScriptFullPath, 202, 0)
			Else
				GUICtrlSetImage($h, @ScriptDir & "\inc\ico\yellow.ico")
			EndIf

		Case $Case3
			If $ISCompiled Then
				GUICtrlSetImage($h, @ScriptFullPath, 201, 0)
			Else
				GUICtrlSetImage($h, @ScriptDir & "\inc\ico\red.ico")
			EndIf

	EndSelect
	Return $Return
EndFunc   ;==>_AddItemToListView

Func _Set_ISP_Ban_Probability_Color($h, $1 = '')
	If Not $EnableISPCheck Then
		Return
	EndIf
	Local $String, $M
	If Not $1 Then
		$String = GUICtrlRead($h)
		$M = StringSplit($String, "|", 2)
		If @error Then Return
		$1 = $M[0]
	EndIf

	$1 = StringSplit($1, ":")
	$1 = $1[1]

	Local $ISPFound
	Local $Red = 0xFFD1D1, $Yellow = 0xFFFBD1, $Green = 0xD1FFD3, $Violet = 0xCF70FF

	Local $PRoxyISP = ProxyGetISP($1)
	If Not @error Then $ISPFound = True
	Local $IsCountryBan = IsCountryBanned($1)

	If $IsCountryBan Then
		GUICtrlSetBkColor($h, $Violet)
		Return
	EndIf

	If Not $ISPFound Then
		GUICtrlSetBkColor($h, $Yellow)
		Return
	EndIf

	Switch IsISPBanned($PRoxyISP)
		Case True
			GUICtrlSetBkColor($h, $Red)
		Case False
			GUICtrlSetBkColor($h, $Green)
	EndSwitch

EndFunc

Func IsISPBanned($ISP)
	For $I = 0 To UBound($aBANNED_ISPs) -1
		If $ISP == $aBANNED_ISPs[$I] Then
			Return True
		EndIf
	Next
	Return False
EndFunc

Func IsCountryBanned($Country)
	For $I = 0 To UBound($aBANNED_Countrys) -1
		If $Country == $aBANNED_Countrys[$I] Then
			Return True
		EndIf
	Next
	Return False
EndFunc

Func ProxyGetISP($IP)
	Local $PRoxyISP, $ISPFound
	$IP = _IPv4ToInt($IP)
	For $i = 0 To UBound($ISP_Array) - 1 Step 3
		If $IP >= $ISP_Array[$i] And $IP <= $ISP_Array[$i + 1] Then
			$PRoxyISP = $ISP_Array[$i + 2]
			$ISPFound = True
			ExitLoop
		EndIf
	Next
	If $ISPFound Then Return SetError(0, 0, $PRoxyISP)
	Return SetError(1, 0, 0)
EndFunc

Func _ProxyBanCheck()

	If $IsInOperation Then
		MsgBox($MB_ICONINFORMATION, "Information...", "Cannot complete request at his time, please try again later.", $BANEVADER)
		Return
	EndIf

	ReDim $IPBANCHECK[1][10]
	$IPBANCHECK[0][0] = 0

	For $I = 0 To _GUICtrlListView_GetItemCount($ListView32)
		If _GUICtrlListView_GetItemSelected($ListView32, $I) Then
			$IPBANCHECK[0][0] += 1
			ReDim $IPBANCHECK[$IPBANCHECK[0][0]+1][10]
			$IPBANCHECK[$IPBANCHECK[0][0]][$BAN_IP] = _GUICtrlListView_GetItemText($ListView32, $I)

		EndIf
	Next

	If $IPBANCHECK[0][0] Then

		_GetNewCaptcha()

		GUISetState(@SW_SHOW, $reCaptcha_UI)

		$IsInOperation = 1
		$StopOperation = 0

		GUICtrlSetState($SCANBUTTON, $GUI_DISABLE)
		GUICtrlSetState($TestButton, $GUI_DISABLE)
		GUICtrlSetState($ClipBoard, $GUI_DISABLE)

		While 1
			Sleep(100); wait until the captcha window is exited..
			If $StopOperation Then ExitLoop
		WEnd

		GUISetState(@SW_HIDE, $reCaptcha_UI)

	Else
		_ConsoleWrite("Please selecet proxy(s) to bancheck." & @CR)
	EndIf

	GUICtrlSetState($TestButton, $GUI_ENABLE)
	GUICtrlSetState($ClipBoard, $GUI_ENABLE)
	GUICtrlSetState($SCANBUTTON, $GUI_ENABLE)

	$IsInOperation = 0
	$StopOperation = 0
	ReDim $IPBANCHECK[1][10]
	$IPBANCHECK[0][0] = 0
	$CurrentCaptchaString = 0

	Return 1

EndFunc

Func _GetNewCaptcha(); this gets called via adlibregister from a windows event message on key down enter
	AdlibUnRegister("_GetNewCaptcha")

	Local $NewCaptcha = GUICtrlRead($reCaptcha_Field)

	If Not StringInStr($NewCaptcha, " ") Then
		$NewCaptcha &= " " & $NewCaptcha
	EndIf

	Local $BaseCaptchaURL = "https://www.google.com/recaptcha/api/challenge?k=6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc&ajax=1"
	Local $Return
	Local $Header
	Local $TestLimiter = 1
	Local Enum $UNTESTED, $TESTED_FAIL, $TESTED_SUCCESS

	Local $tInfo
	Local $iI
	Local $Temp

	;Local Static $Cookie

	If ($NewCaptcha And $CurrentCaptchaString) Then
		$Header = "Cache-Control: max-age=0" & @CRLF & _
				"Accept: */*" & @CRLF & _
				"Origin: https://www.4chan.org" & @CRLF & _
				"Content-Type: application/x-www-form-urlencoded" & @CRLF & _
				"Referer: https://www.4chan.org/banned" & @CRLF & _
				"Accept-Encoding: gzip" & @CRLF & _
				"Accept-Language: en-US,en;q=0.8" & @CRLF & _
				"Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3" & @CRLF & _
				"cookie: 4chan_pass=_nope" & @CRLF; " & $Cookie & @CRLF


		Local $PostURL = "https://www.4chan.org/banned"
		Local $Proxy = Default
		Local $Index = 1
		Local $AddItem = False
		Local $Indicator

		While 1
			If Not IsArray($IPBANCHECK) Or $IPBANCHECK[0][0] < 1  Then
				ReDim $IPBANCHECK[1][10]
				$IPBANCHECK[0][0] = 0
				$StopOperation = 1
				$CurrentCaptchaString = 0
				AdlibUnRegister("_GetNewCaptcha")
				Return
			EndIf
			For $I = 1 To $IPBANCHECK[0][0]
				Switch $IPBANCHECK[$I][$BAN_STATS]
					Case $UNTESTED
						$Proxy = $IPBANCHECK[$I][$BAN_IP]
						$Index = $I
						ExitLoop 2

					Case $TESTED_SUCCESS
						;for failed captchas
						$Proxy = $IPBANCHECK[$I][$BAN_IP]
						$Index = $I
						ExitLoop 2

					Case $TESTED_FAIL
						$Proxy = $IPBANCHECK[$I][$BAN_IP]
						$Index = $I
						If $IPBANCHECK[$I][$BAN_COUNTER] > $TestLimiter Then
							_ArrayDelete($IPBANCHECK, $I)
							$IPBANCHECK[0][0] -= 1
							$Index -= 1

							$tInfo = DllStructCreate($tagLVFINDINFO)
							DllStructSetData($tInfo, "Flags", $LVFI_STRING)
							$iI = _GUICtrlListView_FindItem($ListView32, -1, $tInfo, $Proxy)
							If $iI <> -1 Then _GUICtrlListView_DeleteItem($ListView32, $iI)

							$Temp = _GUICtrlListView_GetItemCount($ListView32)
							_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & $Temp, 1)
							_GUICtrlStatusBar_SetText($hStatusBar, "Proxy " & $Proxy & " marked as dead.", 0)

							$Temp = StringSplit($Proxy, ":")
							If Not @error Then $Temp = $Temp[1]; need to delete by IP alone

							_SQLite_Exec($hProxyDataBase, "INSERT INTO dead WHERE proxy='" & $Temp & "';")
							_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Temp & "';")
							_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Temp & "';")
							_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Temp & "';")
							ExitLoop
						Else
							ExitLoop 2
						EndIf
				EndSwitch
			Next
		WEnd

		If $Proxy Then

			_TerminateSession(); terminate any sessions open or proxy wont take effect

			_GUICtrlStatusBar_SetText($hStatusBar, "Obtaining ban status for " & $proxy & ", please hold.", 0)

			$Return = _WinHTTP_Action($PostURL, "POST", False, Default, $Header, "recaptcha_challenge_field=" & $CurrentCaptchaString & "&recaptcha_response_field=" & StringReplace($NewCaptcha, " ", "+"), Default, Default, $proxy)
			If Not @error And IsArray($Return) Then
;~ 				ConsoleWrite("Captcha Post: " & $Return[1] & @CR)

;~ 				$Temp = StringRegExp($Return[1], "(?i)cookie:\h*([^=\h]+)=([^;]+)", 3)
;~ 				If Not @error Then
;~ 					$Temp = $Temp[0] & "=" & $Temp[1]
;~ 					ConsoleWrite("Cookie: " & $Temp & @CR)
;~ 					$Cookie = $Temp
;~ 				EndIf

				Local $DBGINF[2] = [$Return[1],$Return[0]]

				$Return = _ExtractMessage($Return[0])

				;ConsoleWrite($proxy & ": " & $Return & @CR)

				If $Return = 'captcha' Then
					$IPBANCHECK[$Index][$BAN_STATS] = $TESTED_SUCCESS
					$AddItem = True
					$IPBANCHECK[$Index][$BAN_COUNTER] = 0
					$Indicator = $TESTED_SUCCESS

				ElseIf StringInStr($Return, "not currently banned") Then
					$AddItem = True
					$IPBANCHECK[$Index][$BAN_COUNTER] = 0

					_ArrayDelete($IPBANCHECK, $Index)
					$IPBANCHECK[0][0] -= 1

					_GUICtrlStatusBar_SetText($hStatusBar, $proxy & " WORKS! But it might be ISP banned though...", 0)

				ElseIf (StringInStr($Return, "banned") Or StringInStr($Return, "Restricted")) Then

					Local $Split = StringSplit($Proxy, ":")

					Local $Port = $Split[2], $IP = $Split[1]

					_ArrayDelete($IPBANCHECK, $Index)
					$IPBANCHECK[0][0] -= 1

					If (GUICtrlRead($ShowBanned) = $GUI_CHECKED) Then
						$AddItem = True
						_GUICtrlStatusBar_SetText($hStatusBar, $IP & " is banned or restricted.", 0)
					Else
						$AddItem = False


						_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $IP & "','" & $Port & "');")
						_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $IP & "';")
						_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $IP & "';")
						_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $IP & "';")
						_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $IP & "';")

						$tInfo = DllStructCreate($tagLVFINDINFO)
						DllStructSetData($tInfo, "Flags", $LVFI_STRING)
						$iI = _GUICtrlListView_FindItem($ListView32, -1, $tInfo, $Proxy)
						If $iI <> -1 Then _GUICtrlListView_DeleteItem($ListView32, $iI)

						$Temp = _GUICtrlListView_GetItemCount($ListView32)
						_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & $Temp, 1)
						_GUICtrlStatusBar_SetText($hStatusBar, "Blacklisted " & $IP & " as banned proxy.", 0)

					EndIf

				Else
					$IPBANCHECK[$Index][$BAN_STATS] = $TESTED_FAIL
					$IPBANCHECK[$Index][$BAN_COUNTER] += 1
					$AddItem = False
					_ConsoleWrite(@CR & "!-> UNKNOWN ERROR <-!" & @CR)
					_ConsoleWrite("!->  HEADER INFO  <-!" & @CR & $DBGINF[0] & @CR)
					_ConsoleWrite("!->   HTML INFO   <-!" & @CR & $DBGINF[1] & @CR)
					_ConsoleWrite("	-->PROXY: " & $Proxy & @CR)
					_ConsoleWrite("!-> UNKNOWN ERROR <-!" & @CR & @CR)
					$Indicator = $TESTED_FAIL
					_GUICtrlStatusBar_SetText($hStatusBar, "Unknown error occured, check debug info. - [" & ($TestLimiter - $IPBANCHECK[$Index][$BAN_COUNTER])+1 & "] tries left until removal.", 0)
				EndIf

				If $AddItem Then
					$AddItem = False
					$tInfo = DllStructCreate($tagLVFINDINFO)
					DllStructSetData($tInfo, "Flags", $LVFI_STRING)
					$iI = _GUICtrlListView_FindItem($ListView32, -1, $tInfo, $Proxy)
					$IP = StringSplit($Proxy, ":")
					$IP = $IP[1]
					If $iI <> -1 Then
						If $Indicator = $TESTED_SUCCESS Then
							$Temp = _GUICtrlListView_GetItem($ListView32, $iI, 3)
							$Temp = $Temp[3]
							If Not StringInStr($Temp, "[CAPTCHA FAILED]") Then
								_GUICtrlListView_SetItem($ListView32, "[CAPTCHA FAILED] - " & $Temp, $iI, 3)
								_SQLite_Exec($hProxyDataBase, "UPDATE listviewitems SET banstatus=" & _SQLite_Escape("[CAPTCHA FAILED] - " & $Temp) & " WHERE proxy='" & $IP & "';")
								_SQLite_Exec($hProxyDataBase, "UPDATE topnotch SET banstatus=" & _SQLite_Escape("[CAPTCHA FAILED] - " & $Temp) & " WHERE proxy='" & $IP & "';")
							EndIf
							_GUICtrlStatusBar_SetText($hStatusBar, "You failed the captcha.", 0)
						ElseIf $Indicator = $TESTED_FAIL Then
							$Temp = _GUICtrlListView_GetItem($ListView32, $iI, 3)
							$Temp = $Temp[3]
							If Not StringInStr($Temp, "[UNKOWN ERROR]") Then
								_GUICtrlListView_SetItem($ListView32, "[UNKOWN ERROR] - " & $Temp, $iI, 3)
							EndIf
							_GUICtrlStatusBar_SetText($hStatusBar, "An unknown error has occured.", 0)
						Else
							_GUICtrlListView_SetItem($ListView32, $Return, $iI, 3)
							_SQLite_Exec($hProxyDataBase, "UPDATE listviewitems SET banstatus=" & _SQLite_Escape($Return) & " WHERE proxy='" & $IP & "';")
							_SQLite_Exec($hProxyDataBase, "UPDATE topnotch SET banstatus=" & _SQLite_Escape($Return) & " WHERE proxy='" & $IP & "';")
						EndIf
					EndIf
				EndIf

				If Not $IPBANCHECK[0][0] Then $StopOperation = 1

			Else
				$IPBANCHECK[$Index][$BAN_STATS] = $TESTED_FAIL
				$IPBANCHECK[$Index][$BAN_COUNTER] += 1
				_GUICtrlStatusBar_SetText($hStatusBar, "Error obtaining resource. ErrorCode("&@error&") - [" & ($TestLimiter - $IPBANCHECK[$Index][$BAN_COUNTER])+1 & "] tries left until removal.", 0)
			EndIf

		EndIf

		GUICtrlSetData($reCaptcha_Field, "")

	EndIf

	Local $Img = "https://www.google.com/recaptcha/api/image?c="

	_TerminateSession(); terminate any sessions open or proxy wont take effect

	$Header = "accept: image/webp,*/*;q=0.8" & @CRLF & _
				"accept-encoding: gzip" & @CRLF & _
				"accept-language: en-US,en;q=0.8" & @CRLF & _
				"referer: https://www.4chan.org/banned" & @CRLF; & _
				;"cookie: OGPC=270001-1:; NID=67=NULL; PREF=ID=NULL:FF=0:LD=en:NR=100:TM=1398038321:LM=1398042502:SG=1:S=NULL" & @CRLF

	$Return = _WinHTTP_Action($BaseCaptchaURL, "GET", False, $UserAgentString, $Header)
	If @error Then Return SetError(1, 0, 0)
	$CurrentCaptchaString = StringRegExp($Return[0], "challenge\h*?:\h*?'(.*?)'", 3)
	If @error Then Return SetError(1, 0, 0)
	$CurrentCaptchaString = $CurrentCaptchaString[0]

	;ConsoleWrite("Captcha Image: " & $Return[1] & @CR)

	$Img = "https://www.google.com/recaptcha/api/image?c=" & $CurrentCaptchaString
	;ConsoleWrite($Img & @CR)
	$Img = _WinHTTP_Action($Img, "GET", True, $UserAgentString, $Header)
	If @error Then Return SetError(2, 0, 0)
	;ConsoleWrite($Img[1] & @CR)

	$Img = $Img[0]
	$Img = Load_BMP_From_Mem(Binary($Img), True)
	_WinAPI_DeleteObject(GUICtrlSendMsg($reCaptcha, 0x0172, 0, $Img))
	;AdlibRegister("_GetNewCaptcha", $CaptchaExpire)
	Return SetError(1,0,"")
EndFunc   ;==>_GetNewCaptcha

#endregion - Proxy Testing Code -

#region - CONCEPT CODE -

Func TestProxy()
	GUICtrlSetData($RatingView, "")
	AdlibUnRegister("TestProxy")
	$IsInOperation = 1
	;Local $Results

	GUICtrlSetState($SCANBUTTON, $GUI_DISABLE)
	GUICtrlSetState($ClipBoard, $GUI_DISABLE)
	GUICtrlSetState($TestButton, $GUI_DISABLE)

	_GUIToolTip_Destroy($hBBToolTipControl)

	If $ServerStatus Then
		If (UBound($aItemSelected) < 3) Then Return
		If $aItemSelected[0] = -1 Then Return
		If $aItemSelected[1] Then Return
		If Not $aItemSelected[0] And Not _GUICtrlListView_GetItemSelected($ListView32, 0) Then Return 0
		Local $IP = _GUICtrlListView_GetItemText($ListView32, $aItemSelected[0])
		If Not $IP Then Return 0

		_GUICtrlStatusBar_SetText($hStatusBar, "Please hold, establishing connection...", 0)

		$IsInOperation = 1

		Local $tURL_COMPONENTS = DllStructCreate($tagTHREAD_PARAMETERS)

		DllStructSetData($tURL_COMPONENTS, "UserAgent", "(Compatable; BanBuster)")
		DllStructSetData($tURL_COMPONENTS, "HTTPVerb", "POST")
		DllStructSetData($tURL_COMPONENTS, "Host", $ExternalIP)
		DllStructSetData($tURL_COMPONENTS, "Resource", "/BanBuster ")
		DllStructSetData($tURL_COMPONENTS, "Port", $ProxyTestPort)

		Local $ContentType = "Accept: */*" & @CRLF

		DllStructSetData($tURL_COMPONENTS, "Referer", '')
		DllStructSetData($tURL_COMPONENTS, "Headers", $ContentType)
		DllStructSetData($tURL_COMPONENTS, "ExtraData", "")

		DllStructSetData($tURL_COMPONENTS, "Length", 0)
		DllStructSetData($tURL_COMPONENTS, "TotalLength", 0)

		DllStructSetData($tURL_COMPONENTS, "dwResolveTimeout", 30000)
		DllStructSetData($tURL_COMPONENTS, "dwConnectTimeout", 30000)
		DllStructSetData($tURL_COMPONENTS, "dwSendTimeout", 30000) ; 15 seconds
		DllStructSetData($tURL_COMPONENTS, "dwReceiveTimeout", 30000)

		DllStructSetData($tURL_COMPONENTS, "Proxy", $IP)
		DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NAMED_PROXY)
		DllStructSetData($tURL_COMPONENTS, "SendFlags", $WINHTTP_FLAG_ESCAPE_DISABLE)

		DllStructSetData($tURL_COMPONENTS, "RetryTimes", 2)
		DllStructSetData($tURL_COMPONENTS, "MaxTestTime", 30)

		; finally. create the thread and send it the structure and tell it what type of method to use
		;FileWrite(".\Added.txt", @HOUR & ":" & @MIN & ":" & @SEC & ":" & @MSEC & @TAB & "ScanLevel (" & $Level & ")" & @TAB & @TAB & "IP (" & $Proxies[$X][1] & ")" & @CRLF)
		Local $Iteration = 0, $Thread = CheckProxyInAnotherThread(DllStructGetPtr($tURL_COMPONENTS))

		Local Static $ServerStarted
		If $ServerStarted = 0 Then
			TCPStartup()
			$ServerStarted = 1
		EndIf

		Local $Server = TCPListen(@IPAddress1, $ProxyTestPort), $Timer, $Recv, $Accept, $Timer2
		If $Server = -1 Or @Error Then
			MsgBox(0, "Error", "There was an error creating a listening socket on port: " & $ProxyTestPort)
		Else
			$Timer2 = TimerInit()
			While TimerDiff($Timer2) <= 15000
				$Iteration += 1
				If (Int(($Iteration - 1) / 100) = ($Iteration - 1) / 100) Then _GUICtrlStatusBar_SetText($hStatusBar, "Please hold, establishing connection: " & Round(15000 - Int(TimerDiff($Timer2)), -1), 0)
				If $Server <> -1 Then
					$Accept = TcpAccept($Server)
					If $Accept <> -1 Then
						$Timer = TimerInit()
						Do
							Sleep (15)
							$Recv = TcpRecv ($Accept, 1024)
						Until $Recv <> '' Or TimerDiff($Timer) >= 500
						ExitLoop
					EndIf
				EndIf
			WEnd

			DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $Thread, 'DWORD*', 0)
			DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $Thread)

			$Timer = 0
			$Timer2 = 0

			;If $Recv Then ConsoleWrite($Recv & @CR)
		EndIf
	Else
		MsgBox(16, "Error!", "No way to test currently because a server could not be created on your computer.")
	EndIf

	TcpCloseSocket($Server)
	TCPShutdown()
	$ServerStarted = 0
	$IsInOperation = 0

	GUICtrlSetData($RatingView,$IP & ": " & _GetProxyRating($Recv))

	GUICtrlSetState($SCANBUTTON, $GUI_ENABLE)
	GUICtrlSetState($ClipBoard, $GUI_ENABLE)
	GUICtrlSetState($TestButton, $GUI_ENABLE)

	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Idle...", 0)

EndFunc

Func _GetProxyRating($headers)
	Local $Rating = 0
	Local $Description
	Local $Match

	If Not $headers Then
		GUICtrlSetColor($RatingView, 0xFF0000)
		$Description = "No Data Available!"
		$Rating = "Error, no responce."
	EndIf

	If StringRegExp($headers, "(?im)^Forwarded:\h+") Then
		$Rating = "Low"
		GUICtrlSetColor($RatingView, 0xFF0000)
		$Description = "Low Anonymity: 4chan knows who you are"
	EndIf

	If StringRegExp($headers, "(?im)^X-Forwarded-For:\h+") Then
		$Rating = "Medium"
		GUICtrlSetColor($RatingView, 0xFF9000)
		$Description="Medium Anonymity: 4chan knows you're on a proxy, but doesn't know your real IP!"
		$Match = StringRegExp($headers, "(?im)^X-Forwarded-For:\h+([^\h\r\n]+)", 3)
		If Not @error Then
			If $Match[0] == $ExternalIP Then
				$Rating = "Non-Anonymous/Low"
				GUICtrlSetColor($RatingView, 0xFF0000)
				$Description = "Low Anonymity: 4chan knows who you are"
			EndIf
		EndIf
	EndIf

	If Not $Rating Then
		If StringRegExp($headers, "(?im)^via:\h+") Then
			$Rating = "Medium"
			GUICtrlSetColor($RatingView, 0xFF9000)
			$Description = "Medium Anonymity: 4chan knows you're on a proxy, but doesn't know your real IP!"
		Else
			$Rating = "High"
			GUICtrlSetColor($RatingView, 0x0000FF)
			$Description = "High Anonymity: 4chan doesn't know you're on a proxy and doesn't know your real IP."
		EndIf
	EndIf

	If StringRegExp($headers, "(?im)^Connection:\h+keep-alive") Then
		$Rating &= " +KA"
		$Description &= @CRLF & "This proxy also supports ""Keep-Alive"" (+KA)."
	EndIf

	_GUIToolTip_Destroy($hBBToolTipControl)
	$hBBToolTipControl = GuiCtrlSetTip($RatingView, $Description, "Anonymity Level!", 1, 3)
	Return $Rating
EndFunc

#endregion - CONCEPT CODE -

#region - Internet -

; #FUNCTION# ====================================================================================================================
; Name ..........: _GoogleSearch
; Description ...: Scans through google results using your search term
; Syntax ........: _GoogleSearch()
; Parameters ....: None
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; ===============================================================================================================================
Func _GoogleSearch($sSearch)
	;_GUICtrlRichEdit_SetText($Console, "")

	#region - GOOGLE SEARCH -

	Local $Temp, $aTempURLS, $Extra, $datum, $SearchTime, $ComboData = GUICtrlRead($TimeSetting)
	Local $aURLs[1]

	_ConsoleWrite("Creating a google search." & @CR)

	If $ComboData == "Hour" Then; these are the parameters for google searches
		$SearchTime = "qdr:h"
	ElseIf $ComboData == "Day" Then
		$SearchTime = "qdr:d"
	ElseIf $ComboData == "Week" Then
		$SearchTime = "qdr:w"
	ElseIf $ComboData == "Month" Then
		$SearchTime = "qdr:m"
	Else
		_ConsoleWrite("	!->The selected time was incorrect, defaulting to ""week""." & @CR, 13)
		_ConsoleWrite("	Setting search default to ""week""." & @CR)
		$SearchTime = "qdr:w"
	EndIf

	_ConsoleWrite("	Search results time set to " & $ComboData & "." & @CR)

	Local $ReadReturn

	For $I = 0 To GUICtrlRead($PageNumbers) - 1
		If $StopOperation Then Return _GUICtrlStatusBar_SetText($hStatusBar, "Scan aborted.", 0)
		_GUICtrlStatusBar_SetText($hStatusBar, "Scanning Google page " & ($I + 1) & "!", 0)
		If ($I > 0) Then $Extra = "&start=" & $I & "00"

		_ConsoleWrite("	Creating search on page " & $I & "." & @CR)

		; should start to use JSON instead
		;https://www.google.com/uds/GwebSearch?rsz=large&v=1.0&q=8080%20or%203128&start=0

		$ReadReturn = _BanBusterDLL_HTTP_Request("https://www.google.com/search?q=" & StringReplace($sSearch, " ", "+") & "&num=100&filter=0&tbs=" & $SearchTime & $Extra, _
			Default, _
			"(compatable; LinkChecker)", _
			Default)

		;ConsoleWrite($ReadReturn[1] & @CRLF & @CRLF & $ReadReturn[0])

		If @error Then
			_ConsoleWrite("	!->Error(" & @error & ") - Unable to retrieve google results!" & @CR, 10, 0xFF0000)
			ContinueLoop
		EndIf

		_ConsoleWrite("	Search on page " & $I & " completed successfully." & @CR)

		$ReadReturn = $ReadReturn[0]

		$aTempURLS = StringRegExp($ReadReturn, '(?i)(?s).*<ol>(.*)</ol>', 1)
		If Not @error And IsArray($aTempURLS) Then
			;$aTempURLS = StringRegExpReplace($aTempURLS[UBound($aTempURLS) - 1], '(?i)(?s)<div class="r">.*?</div>', ""); stop using this >.>
			$aTempURLS = $aTempURLS[UBound($aTempURLS) - 1]; use this instead
			$aTempURLS = StringRegExp($aTempURLS, '(?i)href="/url\?q=([^<>#\h]+)"', 3)
			If Not @error And IsArray($aTempURLS) Then
				$Temp = UBound($aTempURLS) - 1
				_ConsoleWrite("		Decoding and filetering (" & $Temp + 1 & ") google results" & @CR)
				For $W = 0 To $Temp
					$aTempURLS[$W] = _URLDecode(StringReplace($aTempURLS[$W], "&amp;", "&"))
					If StringInStr($aTempURLS[$W], "&sa=", 2) Then
						$datum = StringSplit($aTempURLS[$W], "&sa=", 3)
						$aTempURLS[$W] = $datum[0]
					EndIf

					If StringInStr($aTempURLS[$W], "webcache.googleusercontent") Then ContinueLoop; fucking niggarig to block those pesky google cache crap..

					$datum = UBound($aURLs)
					ReDim $aURLs[$datum + 1]
					$aURLs[$datum] = $aTempURLS[$W]
				Next
				_ConsoleWrite("		Preparing links..." & @CR)
				$aURLs = _ArrayUnique($aURLs, 1, 1, 0)
				If ($Temp < 98) Then $StopSearch += 1
				If $StopSearch > 1 Then ExitLoop
			Else
				_ConsoleWrite("		->Bad search term or application error." & @CR)
				_ConsoleWrite("		No results obtained." & @CR)
			EndIf
		Else
			_ConsoleWrite("	!->Error in google search results operation." & @CR)
			_ConsoleWrite("	-->Could not extract href links from obtained HTML resource." & @CR)
		EndIf
		If ((GUICtrlRead($PageNumbers) - 1) > $I) Then
			For $T = 3 To 1 Step -1
				_GUICtrlStatusBar_SetText($hStatusBar, "Status: Next iteration in " & $T & " seconds", 0)
				Sleep(1000)
			Next
		EndIf
	Next

	_ConsoleWrite("Search has completed." & @CR)

	$StopSearch = 0

	#endregion - GOOGLE SEARCH -

	#region - Scrapper -

	;Local $hWnd = _WinHttpOpen($UserAgentString)
	;_WinHttpSetTimeouts($hWnd, 0, 5500, 5500, 3000)
	If IsArray($aURLs) Then
		_ConsoleWrite($aURLs[0] & " unique links obtained." & @CR)
		_ConsoleWrite("Beginning webscraper operations." & @CR)
		;_ArrayDisplay($aURLs)
		For $I = 1 To $aURLs[0]
			_GUICtrlStatusBar_SetText($hStatusBar, "Scanning: " & $I & " of " & $aURLs[0] & " Google results!" & @CR, 0)
			If $StopOperation Then ExitLoop
			$datum = _WinHttpCrackUrl($aURLs[$I])
			If Not @error Then
				If _ISBlackListedWebSite($datum[2]) Then
					_ConsoleWrite("	-->Skipping blacklisted domain ")
					_ConsoleWrite($aURLs[$I] & @CR, "", 0x8629FF)
					ContinueLoop
				EndIf
				_SQLite_Exec($hHistoryDataBase, "INSERT INTO google_searched (url) VALUES (" & _SQLite_Escape($aURLs[$I]) & ");")
				If Not @error Then
					_ConsoleWrite(" Creating request to ")
					_ConsoleWrite($aURLs[$I] & @CR, "", 0x59A9FF)
					$ReadReturn = _BanBusterDLL_HTTP_Request($aURLs[$I], _
									Default, _
									$GoogleBotUserAgent, _
									Default)
					If Not @error Then
						_ConsoleWrite("	Request completed successfully." & @CR)
						SaveProxies($ReadReturn[0], $aURLs[$I])
					Else
						_ConsoleWrite("	-->Connection failed for ")
						_ConsoleWrite($aURLs[$I] & @CR, "", 0xFF0000)
					EndIf
				EndIf

			EndIf
		Next
		_ConsoleWrite("Webscrapper has completed operations." & @CR)
	Else
		_ConsoleWrite("No links to follow." & @CR)
		_ConsoleWrite("Exiting webscrapper function." & @CR)
	EndIf

	;_WinHttpCloseHandle($hWnd)

	#endregion - Scrapper -

	_GUICtrlStatusBar_SetText($hStatusBar, "Operation Completed!", 0)

	Return SetError(0, 0, 1)
EndFunc   ;==>_GoogleSearch

; #FUNCTION# ====================================================================================================================
; Name ..........: _ScanDomain
; Description ...: Crawls the inetrnet in search of proxies
; Syntax ........: _ScanDomain($Domain[, $Type = 0[, $max_level = 0[, $domain_only = 1]]])
; Parameters ....: $Domain              - An unknown value.
;                  $Type                - [optional] Type of access to URL. Default is 0 which will start the scan at the domain
;													|instead of the location given after the domain name.
;                  $max_level           - [optional] An unknown value. Default is 0 which is no limit.
;                  $domain_only         - [optional] An unknown value. Default is 1 which will stick to only scanning the address
;													|given and not addresses that will lead it to another and another and so on...
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; ===============================================================================================================================
Func _ScanDomain($Domain, $Type = 0, $max_level = 0, $domain_only = 1)
	_GUICtrlRichEdit_SetText($Console, "")
	If Not $Domain Then Return SetError(1, 0, 0)
	Local $Crack = _WinHttpCrackUrl($Domain)
	If @error Then
		$Domain = "http://" & $Domain
		$Crack = _WinHttpCrackUrl($Domain)
		If @error Then
			_ConsoleWrite("!->This is not a URL" & @CR)
			Return SetError(2, 0, 0)
		EndIf
	EndIf

	If Not UBound($Crack) > 3 And Not StringLen($Crack[2]) > 4 Then
		_ConsoleWrite("!->Invalid URL!" & @CR)
		Return SetError(3, 0, 0);Can't possibly be a real url
	EndIf

	Local $dbtable = StringReplace(StringReplace($Crack[2], "-", "_"), ".", "_")

	Local $firsturl
	Local $fullfirsturl

	Switch $Type
		Case 0
			$firsturl = $Crack[2]
			$fullfirsturl = "http://" & $Crack[2]
		Case 1
			$firsturl = $Crack[2]
			$fullfirsturl = "http://" & $Crack[2] & $Crack[6] & $Crack[7]
	EndSwitch

	_SQLite_Exec($hHistoryDataBase, "CREATE TABLE if not exists " & $dbtable & "_urls (id INTEGER,url TEXT, level INTEGER, PRIMARY KEY (id), UNIQUE (url) ON CONFLICT IGNORE);")
	_SQLite_Exec($hHistoryDataBase, "CREATE TABLE if not exists " & $dbtable & "_info (id INTEGER,lasturl TEXT, PRIMARY KEY (id));")
	_SQLite_Exec($hHistoryDataBase, "INSERT INTO " & $dbtable & "_urls (url, level) VALUES ('" & $fullfirsturl & "', 1);")
	_SQLite_Exec($hHistoryDataBase, "INSERT INTO " & $dbtable & "_info (lasturl) VALUES ('1');")

	Local $info

	_SQLite_QuerySingleRow($hHistoryDataBase, "SELECT lasturl FROM " & $dbtable & "_info WHERE id=1", $info)

	Local $Recursion = $info[0] - 1
	Local $changes = 1
	Local $url
	Local $Level
	Local $source
	Local $url_array
	Local $big_insert
	Local $found_url

	Local $hNet = _WinHttpOpen($UserAgentString)
	If @error Then
		_ConsoleWrite("!->Error obtaining winhttp handle!" & @CR)
		_GUICtrlStatusBar_SetText($hStatusBar, "Status: Error in operation! No INET!", 0)
		Return SetError(7, 0, 0)
	EndIf

	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Scanning...", 0)

	Local $url_query
	Local $level_query

	While 1

		If $StopOperation Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: Domain Crawling Aborted!", 0)
			Return 1
		EndIf

		$Recursion += 1

		If StringRight($Recursion, 1) = 0 Then _SQLite_Exec($hHistoryDataBase, "UPDATE " & $dbtable & "_info SET lasturl='" & $Recursion & "';")
		_SQLite_QuerySingleRow($hHistoryDataBase, "SELECT url FROM " & $dbtable & "_urls WHERE id=" & $Recursion, $url_query)
		_SQLite_QuerySingleRow($hHistoryDataBase, "SELECT level FROM " & $dbtable & "_urls WHERE id=" & $Recursion, $level_query)

		$url = $url_query[0]
		$Level = $level_query[0]

		Switch $url
			Case True
				If CheckType($url) Then
					_ConsoleWrite("	--\\>[" & $Recursion & "]  Level: " & $Level & " Skipping= " & $url & @CR)
					ContinueLoop
				Else
					;_ConsoleWrite("+>[" & $Recursion & "] GET URL Level: " & $level & " Source= " & $url &@CR)
				EndIf
			Case False
				_ConsoleWrite("Scan Compleated" & @CR)
				_GUICtrlStatusBar_SetText($hStatusBar, "Status: Scanning compleated!", 0)
				Return SetError(0, 0, $Recursion)
		EndSwitch

		_GUICtrlStatusBar_SetText($hStatusBar, "Scanning: " & $url, 0)

		$source = _GetSource($hNet, $url)
		If @error Then
			_ConsoleWrite("!>Error Getting URL Source: (ErrorCode: " & @error & ") (Extended: = " & @extended & ")" & @CR, 12)
			ContinueLoop
		EndIf
		SaveProxies($source, $url)

		$url_array = StringRegExp($source, '(?i)href=([^<>#\h]+)', 3)

		If Not @error Then
			$big_insert = ""
			For $I = 0 To UBound($url_array) - 1
				;MsgBox(0,"",$url_array[$i])
				$found_url = $url_array[$I]
				$found_url = StringReplace($found_url, Chr(39), "")
				$found_url = StringReplace($found_url, Chr(34), "")
				$found_url = StringReplace($found_url, "amp;", "")
				$found_url = StringReplace($found_url, "./", "")

				If StringInStr($found_url, "rss") Then ContinueLoop
				If StringInStr($found_url, "rand=") Then ContinueLoop

				If Not StringInStr($found_url, "http://", 2) Then
					$Domain = _WinHttpCrackUrl($url)
					If @error Then
						;_ConsoleWrite("!>Error, Invalid URL!" &@CR)
						ContinueLoop
					EndIf
					$found_url = "http://" & $Domain[2] & "/" & $found_url
				ElseIf Not StringInStr($found_url, $firsturl, 2) And $domain_only Then
					_ConsoleWrite("		-->Skipping URL: " & $found_url &@CR)
					ContinueLoop
				EndIf

				If $max_level <> 0 Then
					If $Level >= $max_level Then
						;_ConsoleWrite(@CR & $Recursion & " Don't GET URLS because of LEVEL limit: " & $found_url)
						;If $ReturnOnLevelLimit Then Return
						ContinueLoop
					Else
						$big_insert = $big_insert & "INSERT INTO " & $dbtable & "_urls (url, level) VALUES ('" & $found_url & "', " & $Level + 1 & "); "
					EndIf
				Else
					$big_insert = $big_insert & "INSERT INTO " & $dbtable & "_urls (url, level) VALUES ('" & $found_url & "', " & $Level + 1 & "); "
				EndIf
			Next

			_SQLite_Exec($hHistoryDataBase, $big_insert)
			$changes = $changes - _SQLite_TotalChanges($hHistoryDataBase)
			$changes = $changes * - 1
			If $changes Then _GUICtrlStatusBar_SetText($hStatusBar, "Status: Scanning " & $changes & " links!", 0)
			;_ConsoleWrite("+>FOUND " & $changes & " URLs: " &@CR)
			$changes = _SQLite_TotalChanges($hHistoryDataBase)
		EndIf

	WEnd

	_WinHttpCloseHandle($hNet)

	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Scanning compleated!", 0)

	Return 1

EndFunc   ;==>_ScanDomain

; #FUNCTION# ====================================================================================================================
; Name ..........: _GetSource
; Description ...: Gets the HTML of the address passed to it
; Syntax ........: _GetSource(Byref $Hwnd, $url)
; Parameters ....: $Hwnd                - [in/out] Handle to http session.
;                  $url                 - A URL.
; Return values .: Html if successful, error otherwise
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; Related .......: _ScanDomain
; ===============================================================================================================================
Func _GetSource(ByRef $hWnd, $url)
	Local $Error
	Local $aUrl = _WinHttpCrackUrl($url)
	If @error Then Return SetError(2, @error, False)
	Local $hConnect = _WinHttpConnect($hWnd, $aUrl[2])
	If @error Then
		$Error = @error
		_WinHttpCloseHandle($hConnect)
		Return SetError(3, $Error, False)
	EndIf
	Local $hRequest = _WinHttpSimpleSendRequest($hConnect, Default, $aUrl[6] & $aUrl[7])
	If @error Then
		$Error = @error
		_WinHttpCloseHandle($hRequest)
		_WinHttpCloseHandle($hConnect)
		Return SetError(4, $Error, False)
	EndIf
	If $hRequest Then
		Local $html = _WinHttpSimpleReadData($hRequest)
		If @error Then
			$Error = @error
			_WinHttpCloseHandle($hRequest)
			_WinHttpCloseHandle($hConnect)
			Return SetError(5, $Error, False)
		EndIf
	Else
		_WinHttpCloseHandle($hRequest)
		_WinHttpCloseHandle($hConnect)
		Return SetError(1, 0, False)
	EndIf
	_WinHttpCloseHandle($hRequest)
	_WinHttpCloseHandle($hConnect)
	Return SetError(0, 0, $html)
EndFunc   ;==>_GetSource

Func _GetNewThreadID($ThreadNum = 0)
	Static Local $Recursions = 0
	Local $Data, $ID
	Local $Headers = "pragma: no-cache" & @CRLF & _
		"accept-encoding: gzip,deflate,sdch" & @CRLF & _
		"accept-language: en-US,en;q=0.8" & @CRLF & _
		"accept: */*" & @CRLF & _
		"cache-control: no-cache" & @CRLF & _
		"referer: https://boards.4chan.org/b/" & @CRLF

	Local $Return = _WinHTTP_Action( _
		"https://api.4chan.org/b/1.json", _
		"get", _
		False, _
		$UserAgentString, _
		$Headers, _
		False _
		)

	If Not @error Then
		$Data = $Return[0]
	EndIf

	$Data = StringRegExp($Data, '"posts":\s?\[\{(.*?)\}', 3)
	If @error Then
		$Recursions += 1
		_ConsoleWrite("!>There was an error retrieving a thread number" & @CR, 12)
		_ConsoleWrite("->Reattempting to retrieve a test thread ID step: " & $Recursions & @CR, 12)

		Sleep(5000); allow time for threads to exit, maybe this happened due to network overload..

		If ($Recursions < 5) Then
			$ThreadNum = _GetNewThreadID($ThreadNum)
			If Not @error Then Return SetError(0, 0, $ThreadNum)
		EndIf

		; stuff below will be called like 5 times but who cares!

		If (Int($ThreadNum) < 1) Then $StopOperation = True; fucking STOP everything because now we know something is wrong hurr durrpfpf

		$Recursions = 0
		Return SetError(7, 0, $ThreadNum); return old thread number

	Else

		For $I = 0 To UBound($Data) - 1
			If StringInStr($Data[$I], '"sticky":1', 2) Or StringInStr($Data[$I], '"closed":1', 2) Then ContinueLoop; make sure it's not locked or a sticky
			$Data = StringRegExp($Data[$I], '"no":(\d{3,12}),', 3); extract thread number
			If @error Then
				Return SetError(8, 0, $ThreadNum); return old thread number if error
			EndIf
			$ID = $Data[0]; return new thread ID
			ExitLoop
		Next
	EndIf
	_ConsoleWrite("Testing on new thread ID: >>" & $ID & @CR)
	Return SetError(0, 0, $ID)
EndFunc   ;==>_GetNewThreadID

; #FUNCTION# ====================================================================================================================
; Name ..........: _WinHTTP_Action
; Description ...:
; Syntax ........: _WinHTTP_Action($Page[, $Action = Default[, $bBinary = Default[, $sUserAgent = Default[, $headers = Default[,
;                  $AdditionalData = Default[, $ReadReturn = Default[, $sReferer = Default[, $Proxy = Default[,
;                  $SessionDur = Default]]]]]]]]])
; Parameters ....: $Page                - String value of internet resource
;
;                  $Action              - [optional] HTTP verb to use in the request. Default is "GET".
;
;                  $bBinary             - [optional] A bool value. Default is False, which returns data as text.
;                                            | True returns binary, such as a file on the internet, like an exe.
;
;                  $sUserAgent          - [optional] A string value. Default is a GoogleBot user-agent string.
;                                            | A GoogleBot user-agent is used because sometimes it allows you to bypass
;                                            | a websites login requests, sites do this to optimize websearch results for their
;                                            | sites so we take advantage of this little trick.
;
;                  $headers             - [optional] A string value. Default is to accept all, keep alive and request
;                                           | compressed gzip encoding to reduce load.
;
;                  $AdditionalData      - [optional] A string value. Default is nothing, this is where you typically send
;                                             | the target server some arguments/variables or other stuff.
;
;                  $ReadReturn          - [optional] An bool value. Default is True and will return response headers and
;                                            | data in an array. False will just make the POST or GET request and come back.
;
;                  $sReferer            - [optional] A string value. Default is nothing I think.
;
;                  $Proxy               - [optional] A string value. Default is not to use a proxy, if you want to use a proxy
;                                            | then just put it in like "123.123.123.123:54321".
;
;                  $SessionDur          - [optional] An int value. Default is 60000 miliseconds which is 60 seconds.
;                                            | this is used to tell the function how long this session is supposed to last
;                                            | while this function is not called for an extended time.
;                                            | is this value is zero (0), the session is terminated upon compleation...
;
; Return values .: An array.
;                    0|HTML
;                    1|Responce Headers
;
; Author ........: ScriptKitty
; Remarks .......: This function will automatically handle compressed data, charset type, session, http/https access
; Example .......: No
; ===============================================================================================================================

Func _BanBusterDLL_HTTP_Request($Page, $Action = Default, $sUserAgent = Default, $headers = Default)
	Local $Crack = _WinHttpCrackUrl($Page)
	If @error Then Return SetError(3, 0, 0)
	Local $DefHeaders = _
		"Connection: Keep-alive" & @CRLF & _
		"Accept: */*" & @CRLF & _
		"Accept-Encoding: *;q=0" & @CRLF

	__WinHttpDefault($Action, "GET")
	__WinHttpDefault($sUserAgent, $GoogleBotUserAgent)
	__WinHttpDefault($headers, $DefHeaders)


		#Region - MT Request -

		Local $tURL_COMPONENTS = DllStructCreate($tagTHREAD_PARAMETERS)

		DllStructSetData($tURL_COMPONENTS, "UserAgent", $sUserAgent)
		DllStructSetData($tURL_COMPONENTS, "HTTPVerb", $Action)
		DllStructSetData($tURL_COMPONENTS, "Host", $Crack[2])
		DllStructSetData($tURL_COMPONENTS, "Resource", $Crack[6] & $Crack[7])
		DllStructSetData($tURL_COMPONENTS, "Port", $INTERNET_DEFAULT_HTTP_PORT)

		DllStructSetData($tURL_COMPONENTS, "Referer", '')
		DllStructSetData($tURL_COMPONENTS, "Headers", $headers)
		DllStructSetData($tURL_COMPONENTS, "ExtraData", "")

		DllStructSetData($tURL_COMPONENTS, "Length", 0)
		DllStructSetData($tURL_COMPONENTS, "TotalLength", 0)

		DllStructSetData($tURL_COMPONENTS, "dwResolveTimeout", 30000)
		DllStructSetData($tURL_COMPONENTS, "dwConnectTimeout", 30000)
		DllStructSetData($tURL_COMPONENTS, "dwSendTimeout", 30000) ; 15 seconds
		DllStructSetData($tURL_COMPONENTS, "dwReceiveTimeout", 30000)

		DllStructSetData($tURL_COMPONENTS, "Proxy", "")
		DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NO_PROXY)
		DllStructSetData($tURL_COMPONENTS, "SendFlags", $WINHTTP_FLAG_ESCAPE_DISABLE)

		DllStructSetData($tURL_COMPONENTS, "RetryTimes", 2)
		DllStructSetData($tURL_COMPONENTS, "MaxTestTime", 30)

		; finally. create the thread and send it the structure and tell it what type of method to use
		;FileWrite(".\Added.txt", @HOUR & ":" & @MIN & ":" & @SEC & ":" & @MSEC & @TAB & "ScanLevel (" & $Level & ")" & @TAB & @TAB & "IP (" & $Proxies[$X][1] & ")" & @CRLF)
		Local $Thread = CheckProxyInAnotherThread(DllStructGetPtr($tURL_COMPONENTS))

		#EndRegion - MT Request -

		If @error Then
			Return SetError(2, 0, 0)
		EndIf

		Local $Request

		For $I = 0 To 15
			Sleep(1000)
			$Request = DllStructGetData($tURL_COMPONENTS, "ResponceHTML")
			If $Request Then ExitLoop
		Next

		DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $Thread, 'DWORD*', 0)
		DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $Thread)

		If $Request Then
			Local $Return[2] = [$Request,DllStructGetData($tURL_COMPONENTS, "ResponceHeaders")]
			Return SetError(0, 0, $Return)
		Else
			Return SetError(1, 0, 0)
		EndIf
EndFunc

Func _WinHTTP_Action( _
		$Page, _
		$Action = Default, _
		$bBinary = Default, _
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
			"Accept-Encoding: gzip;q=0.9,*;q=0" & @CRLF

	__WinHttpDefault($Action, "GET")
	__WinHttpDefault($bBinary, False)
	__WinHttpDefault($sUserAgent, "Googlebot/2.1 (+http://www.google.com/bot.html)")
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

	_WinHttpSetOption($hRequest, $WINHTTP_OPTION_REDIRECT_POLICY, $WINHTTP_OPTION_REDIRECT_POLICY_ALWAYS); allow redirects

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
		If $bBinary Then
			$aReturn[0] = Binary($Data)
		Else
			$aReturn[0] = BinaryToString($Data, $iCharset)
		EndIf
	Else
		If $bBinary Then
			$aReturn[0] = Binary($Data)
		Else
			$aReturn[0] = BinaryToString($aReturn[0], $iCharset)
		EndIf
	EndIf

	If $SessionDur = 0 Then _TerminateSession()

	_WinHttpCloseHandle($hRequest)
	_WinHttpCloseHandle($hConnect)
	Return SetError(0, 0, $aReturn)
EndFunc   ;==>_WinHTTP_Action

; #FUNCTION# ====================================================================================================================
; Name ..........: _TerminateSession
; Description ...: Terminates a session after it's idled for a while.
; Syntax ........: _TerminateSession()
; Parameters ....: None
; Return values .: None
; Author ........: ScriptKitty
; Example .......: No
; ===============================================================================================================================
Func _TerminateSession()
	AdlibUnRegister("_TerminateSession")
	If ($_WinHTTP_CurrentSession[0] <> -1) Then
		_WinHttpCloseHandle($_WinHTTP_CurrentSession[0])
		$_WinHTTP_CurrentSession[0] = -1
	EndIf
EndFunc   ;==>_TerminateSession

Func PingSys(); not really a ping, but will check 4chans server status indicator which is used by the status.4chan.org domain to tell users if posting is up
	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Checking sys.4chan.org, please hold...", 0)
	TCPStartup()
	Local $iSocket = TCPConnect(TCPNameToIP("sys.4chan.org"), 80)
	If @error Then
		$ServersStatus = 0
	Else
		$ServersStatus = 1
	EndIf
	TCPCloseSocket($iSocket)
	TCPShutdown()
EndFunc   ;==>PingSys

Func _ISBlackListedWebSite($Domain)
	$Domain = StringReplace($Domain, "www.", "")
	For $I = 0 To UBound($Blacklistedwebsites) - 1
		If StringInStr($Domain, $Blacklistedwebsites[$I], 2) Then Return 1
	Next
	Return 0
EndFunc   ;==>_ISBlackListedWebSite

; #FUNCTION# ====================================================================================================================
; Name ..........: CheckType
; Description ...: Determins of URL is path to file
; Syntax ........: CheckType($url)
; Parameters ....: $url                 - A URL.
; Return values .: true/false
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; ===============================================================================================================================
Func CheckType($url); avoid scanning files... Ido theis cause I don't know how to check the headers sent
	If StringRight($url, 4) == ".jpg" Or _
			StringRight($url, 5) == ".jpeg" Or _
			StringRight($url, 4) == ".gif" Or _
			StringRight($url, 4) == ".png" Or _
			StringRight($url, 5) == ".apng" Or _
			StringRight($url, 4) == ".svg" Or _
			StringRight($url, 4) == ".ico" Or _
			StringRight($url, 4) == ".bmp" Then

		Return 1
	ElseIf StringRight($url, 4) == ".mp3" Or _
			StringRight($url, 4) == ".wav" Then

		Return 1
	ElseIf StringRight($url, 4) == ".avi" Or _
			StringRight($url, 4) == ".wmv" Or _
			StringRight($url, 4) == ".mpg" Or _
			StringRight($url, 4) == ".flv" Or _
			StringRight($url, 5) == ".mpeg" Then

		Return 1
	ElseIf StringRight($url, 4) == ".exe" Or _
			StringRight($url, 4) == ".zip" Or _
			StringRight($url, 4) == ".rar" Or _
			StringRight($url, 3) == ".gz" Or _
			StringRight($url, 4) == ".tar" Then

		Return 1
	Else
		Return 0
	EndIf
EndFunc   ;==>CheckType

; #FUNCTION# ====================================================================================================================
; Name ..........: SaveProxies
; Description ...: Detects and saves proxies in data given to it
; Syntax ........: SaveProxies([$source = 0])
; Parameters ....: $source              - [optional] Data with proxies in it.
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; Remarks .......: Regular expression can be improved
; ===============================================================================================================================
Func SaveProxies($source, $url = '')
	Local $Data
	Local $New = 0
	Local $Half
	Local $Count
	Local $ProxyFound
	Local $html = $source & @CR
	Local $Proxy
	$AlreadyExistsCount = 0

	$html = StringRegExpReplace($html, '<[^<]*>', ":")
	$html = StringRegExpReplace($html, '(?:\r|\n|\f|\h)', ":")
	$html = StringRegExp($html, "(?:\d{1,3}\.){3}\d{1,3}:+?\d{2,5}", 3)
	If Not @error Then
		$Count = UBound($html)
		For $I = 0 To $Count - 1
			$source &= $html[$I] & @CR
		Next
		$Half = True
	EndIf
	$source = StringRegExpReplace($source, ':{2,}', ":")

	$ProxyFound = StringRegExp($source, $IP_ADDRESS_REGEXP, 3)
	If Not @error Then
		$Count = UBound($ProxyFound)
		_SQLITE_LOCK(1); makes things a little faster
		_ConsoleWrite("	Found ")
		If $Half Then
			_ConsoleWrite(Int($Count/2), "", 0xFFDD00)
		Else
			_ConsoleWrite($Count, "", 0xFFDD00)
		EndIf
		_ConsoleWrite(" proxies." & @CR)
		If $ClipboardActivated And ($Count < 105) Then
			_ConsoleWrite("Overide initiated." & @CR & "Adding proxies regardless if they existed in the database!" & @CR)
			For $I = 0 To $Count - 1
				$proxy = StringSplit($ProxyFound[$I], ":")
				If Not @error Then
					_SQLite_Exec($hProxyDataBase, "INSERT INTO proxies (proxy, port) VALUES ('" & $proxy[1] & "','" & $proxy[2] & "');")
					If Not @error Then
						$Found += 1
						$New += 1
					Else
						$AlreadyExistsCount += 1
					EndIf
					If Int(($I - 1) / 25) = ($I - 1) / 25 Then
						_GUICtrlStatusBar_SetText($hStatusBar, "New: " & $Found & " Old: " & $AlreadyExistsCount, 1)
					EndIf
				EndIf
			Next
		Else
			If ($Count > 9001) And $url Then
				_ConsoleWrite("	!->Adding a large amount of proxies." & @CR)
				_ConsoleWrite("		-->Press the [s] key to skip~" & @CR)
			EndIf
			For $I = 0 To $Count - 1

				If _IsPressed("53", $hUSER32) Then
					If WinActive($BANEVADER, "") Then ExitLoop
				EndIf
				;DllCall($hNTDLL,"dword","NtDelayExecution","int",0,"ptr",$MS)
				If $StopOperation Then
					_SQLITE_LOCK()
					_GUICtrlStatusBar_SetText($hStatusBar, "New: " & $Found & " Old: " & $AlreadyExistsCount, 1)
					Return
				EndIf
				If Int(($I - 1) / 25) = ($I - 1) / 25 Then
					_GUICtrlStatusBar_SetText($hStatusBar, "New: " & $Found & " Old: " & $AlreadyExistsCount, 1)
				EndIf

				$proxy = StringSplit($ProxyFound[$I], ":")
				If @error Then
					$AlreadyExistsCount += 1
					ContinueLoop
				EndIf

				_SQLite_QuerySingleRow($hProxyDataBase, "SELECT proxy FROM dead WHERE proxy='" & $proxy[1] & "'", $Data)
				;If @error Then _ConsoleWrite("!->SQLite Error: " & @error & @CR & ">Message: " & $aSQLITE_MESSAGES[_SQLite_ErrCode($hProxyDataBase)] & @CR)
				If $Data[0] Then
					$AlreadyExistsCount += 1
					ContinueLoop
				EndIf
				_SQLite_QuerySingleRow($hProxyDataBase, "SELECT proxy FROM blacklist WHERE proxy='" & $proxy[1] & "'", $Data)
				;If @error Then _ConsoleWrite("!->SQLite Error: " & @error & @CR & ">Message: " & $aSQLITE_MESSAGES[_SQLite_ErrCode($hProxyDataBase)] & @CR)
				If $Data[0] Then
					$AlreadyExistsCount += 1
					ContinueLoop
				EndIf
				_SQLite_QuerySingleRow($hProxyDataBase, "SELECT proxy FROM topnotch WHERE proxy='" & $proxy[1] & "'", $Data)
				;If @error Then _ConsoleWrite("!->SQLite Error: " & @error & @CR & ">Message: " & $aSQLITE_MESSAGES[_SQLite_ErrCode($hProxyDataBase)] & @CR)
				If $Data[0] Then
					$AlreadyExistsCount += 1
					ContinueLoop
				EndIf
				_SQLite_QuerySingleRow($hProxyDataBase, "SELECT proxy FROM graveyard WHERE proxy='" & $proxy[1] & "'", $Data)
				;If @error Then _ConsoleWrite("!->SQLite Error: " & @error & @CR & ">Message: " & $aSQLITE_MESSAGES[_SQLite_ErrCode($hProxyDataBase)] & @CR)
				If $Data[0] Then
					$AlreadyExistsCount += 1
					ContinueLoop
				EndIf
				_SQLite_Exec($hProxyDataBase, "INSERT INTO proxies (proxy, port) VALUES ('" & $proxy[1] & "','" & $proxy[2] & "');")
				If Not @error Then
					$Found += 1
					$New += 1
				Else
					$AlreadyExistsCount += 1
				EndIf
			Next
		EndIf
		_GUICtrlStatusBar_SetText($hStatusBar, "New: " & $Found & " Old: " & $AlreadyExistsCount, 1)
		Switch $New
			Case 0
				_ConsoleWrite("	No new proxies detected." & @CR, 9)
			Case Else
				_ConsoleWrite("		 " & $New, "", 0xFFDD00)
				_ConsoleWrite(" have been saved from this address." & @CR)
		EndSwitch
		_SQLITE_LOCK()
	Else
		_ConsoleWrite("	No proxies were found in resource." & @CR, 9)
		Return SetError(1)
	EndIf
	Return
EndFunc   ;==>SaveProxies

Func _ScanHideMyAss()
	$Found = 0
	Local $Page, $Proxies, $Return
	For $I = 1 To GUICtrlRead($PageNumbers)
		If $StopOperation Then Return
		If (GUICtrlRead($PageNumbers) < $I) Then ExitLoop
		$Page = StringFormat("http://hidemyass.com/proxy-list/%s", $I)
		$Return = _WinHTTP_Action($Page, "GET")
		If Not @error Then $Return = $Return[0]
		$Proxies = _UnHideMyAss($Return)
		If @error Then Return
		SaveProxies($Proxies)
		Sleep(3000)
	Next
EndFunc   ;==>_ScanHideMyAss

; #FUNCTION# ====================================================================================================================
; Name ..........: _UnHideMyAss
; Description ...: Decodes proxies from hidemyass
; Syntax ........: _UnHideMyAss($HTML)
; Parameters ....: $HTML - HTML web source.
; Return values .: A string white space delimetered list
; Author ........: ScriptKitty
; Modified ......:
; Remarks .......: ...
; Example .......: No
; ===============================================================================================================================
Func _UnHideMyAss($html)
	Local $ProxyList; = $HTML

	Local $Fields = StringRegExp(StringStripWS($html, 8), "(?i)<tr[^>]*>((?s).+?)</tr>", 3); seperate the groups of entries
	If Not @error Then

		Local $indexCount
		Local $aCSS
		Local $sTemp

		For $o = 0 To UBound($Fields) - 1

			$html = $Fields[$o]

			$aCSS = StringRegExp($html, "(?i)\.([^{]+){display:([^}]+)}", 3); get css values
			If @error Then ContinueLoop

			$sTemp = $aCSS
			ReDim $aCSS[9999][2]
			$indexCount = 0

			For $I = 0 To (UBound($sTemp) - 1) Step 2; load styles to array
				$aCSS[$indexCount][0] = $sTemp[$I]
				$aCSS[$indexCount][1] = $sTemp[$I + 1]
				$indexCount += 1
			Next

			ReDim $aCSS[$indexCount][2]

			$html = StringRegExpReplace($html, '(?i)<[^>]*style=[^>]*display:[^>]*none[^>]*>[^<]*</[^>]*>', ""); remove the ones that will not show up

			For $I = 0 To UBound($aCSS) - 1
				If StringInStr($aCSS[$I][1], "none", 2) Then _; remove the CSS styles none displayed entities or whatever
						$html = StringRegExpReplace($html, '(?i)<[^>]*(?i:class|name|id)=[''"]' & $aCSS[$I][0] & '[''"]>[^<]*</[^>]*>', "")
			Next

			$html = StringRegExpReplace($html, '(?i)<[^>]*>([\s\S]+)</[^>]*>', "$1"); remove dummy tags
			$html = StringRegExpReplace(StringStripWS($html, 8), '(?i)<td>([^<]+)</td>', ":$1"); set port
			$html = StringRegExpReplace($html, '<[^<]*>', ""); remove everything else now

			$ProxyList &= $html & @CRLF
		Next
	EndIf

	Return SetError(0, 0, $ProxyList)
EndFunc   ;==>_UnHideMyAss

Func _URLDecode($toDecode); there are functions to do this but meh. who cares, this works just fine and speed here is no issue
	Local $strChar, $iOne, $iTwo
	Local $aryHex = StringSplit($toDecode, "")
	For $I = 1 To $aryHex[0]
		If $aryHex[$I] = "%" Then
			$iOne = $aryHex[$I + 1]
			$iTwo = $aryHex[$I + 2]
			$strChar &= Chr(Dec($iOne & $iTwo))
			$I += 2
		Else
			$strChar = $strChar & $aryHex[$I]
		EndIf
	Next
	Return StringReplace($strChar, "+", " ")
EndFunc   ;==>_URLDecode

#endregion - Internet -

#region - USER INTERFACE -
; this area contains mostly code for interaction with the UI and some other stuff

Func RegisterMessages($DoWhat = 0)
	If $Initilize Then Return
	; This section is basically what makes BB responsive.
	; it's not as responsive as a typical low level language, but for bieng an autoit script, this helps make things decent.
	; there is a warning about using this type of method to interpret user interaction, and some people say not to use it, but I've never had a problem and prefer it to any other method...
	Switch $DoWhat
		Case 1
			GUIRegisterMsg($WM_SIZE, "WM_SIZE")
			GUIRegisterMsg($WM_NOTIFY, "WM_NOTIFY")
			GUIRegisterMsg($WM_COMMAND, "WM_COMMAND")
			GUIRegisterMsg($WM_DROPFILES, "WM_DROPFILES")
			GUIRegisterMsg($WM_GETMINMAXINFO, "WM_GETMINMAXINFO")
		Case 0
			GUIRegisterMsg($WM_SIZE, "")
			GUIRegisterMsg($WM_NOTIFY, "")
			GUIRegisterMsg($WM_COMMAND, "")
			GUIRegisterMsg($WM_DROPFILES, "")
			GUIRegisterMsg($WM_GETMINMAXINFO, "")
	EndSwitch
EndFunc   ;==>RegisterMessages

Func _DisableResizing($TrueFalse = 0); removes style from gui to prevent user from resizing the app, used specifically for when the about tab is active
	Switch $TrueFalse
		Case 1
			GUISetStyle(BitOR($WS_CAPTION, $WS_POPUP, $WS_SYSMENU), -1, $BANEVADER);remove ability to resize...
		Case Else
			GUISetStyle(BitOR($WS_MAXIMIZEBOX, $WS_MINIMIZEBOX, $WS_SIZEBOX, $WS_CAPTION, $WS_POPUP, $WS_SYSMENU), -1, $BANEVADER);remove ability to resize...
	EndSwitch
	Return
EndFunc   ;==>_DisableResizing

Func _DeleteCreditsWindow()
	If IsHWnd($hGui) And ($hGui <> 0) Then GUISetState(@SW_HIDE, $hGui)
EndFunc   ;==>_DeleteCreditsWindow

Func CheckTabs(); manage tabs and things in them
	;DllCall($hUSER32, "int", "RedrawWindow", "hwnd", $hHandle, "int", 0, "int", 0, "int", 1); redraw a window/control
	ToolTip("")
	Local $Tabitem = GUICtrlRead($Tab1)
	Switch $Tabitem
		Case 0
			_DeleteCreditsWindow()
			$OkForToolTips = False
			$StopCreditsShow = True
			If Not $IsInOperation Then _GUICtrlStatusBar_SetText($hStatusBar, "New: " & $Found & " Old: " & $AlreadyExistsCount, 1)
			_FixUI()

		Case 1
			$OkForToolTips = True
			$StopCreditsShow = True
			GUISetState(@SW_HIDE, $hlist_ui)
			_DeleteCreditsWindow()
			If Not $IsInOperation Then
				$ItemCount = _GUICtrlListView_GetItemCount($ListView32)
				_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & $ItemCount, 1)
			EndIf
			_WinAPI_SetWindowPos($Console, 0, Default, Default, Default, Default, $SWP_HIDEWINDOW)
			GUICtrlSetData($RatingView, "")
			_GUIToolTip_Destroy($hBBToolTipControl)
			AdlibRegister("ToolTipsManager", 1000)

		Case 2, 3
			$OkForToolTips = False
			$StopCreditsShow = True
			_WinAPI_SetWindowPos($Console, 0, Default, Default, Default, Default, $SWP_HIDEWINDOW)
			GUISetState(@SW_HIDE, $hlist_ui)
			_DeleteCreditsWindow()

		Case 4
			$OkForToolTips = False
			$StopCreditsShow = False
			_WinAPI_SetWindowPos($Console, 0, Default, Default, Default, Default, $SWP_HIDEWINDOW)
			GUISetState(@SW_HIDE, $hlist_ui)
			AdlibRegister("_ShowCredits", 250)

	EndSwitch
EndFunc   ;==>CheckTabs

Func HideCTRL()
	GUISetState(@SW_HIDE, $hlist_ui)
	Return 1
EndFunc   ;==>HideCTRL

Func SortIt()
	RegisterMessages(); disable all the windows message reciever function because this will make a LOT of them :P
	_GUICtrlListView_SortItems($hListView32, GUICtrlGetState($ListView32))
	RegisterMessages(1)
	Return $__LISTVIEWCONSTANT_GUI_RUNDEFMSG
EndFunc   ;==>SortIt

Func _FixUI()
	Switch (GUICtrlRead($Tab1) <> 0)
		Case True
			_WinAPI_SetWindowPos($Console, 0, 0, 0, 0, 0, $SWP_HIDEWINDOW)
		Case False
			Local $Size = WinGetClientSize($BANEVADER, "")
			_WinAPI_SetWindowPos($Console, 0, 16, 88, $Size[0] - 43, $Size[1] - 128, $SWP_SHOWWINDOW)
	EndSwitch
EndFunc   ;==>_FixUI

Func _ConsoleWrite($Data, $Size = 0, $Color = 0, $Style = 0)
	If Not $Data Then Return

	If $Size Then
		_GUICtrlRichEdit_SetFont($Console, $Size, "courier new")
	Else
		_GUICtrlRichEdit_SetFont($Console, 11, "courier new")
	EndIf

	If $Color Then Return _GUICtrlRichEdit_AppendTextColor($Console, $Data, $Color, $Style)
	Switch StringRight(StringLeft($Data, 2),1)
		Case "+"
			_GUICtrlRichEdit_AppendTextColor($Console, $Data, 0x00FF00)
		Case "~"
			_GUICtrlRichEdit_AppendTextColor($Console, $Data, 0x6A57C9, $Style)
		Case "-"
			_GUICtrlRichEdit_AppendTextColor($Console, $Data, 0xFF7700)
		Case "!"
			_GUICtrlRichEdit_AppendTextColor($Console, $Data, 0xFF0000)
		Case Else
			_GUICtrlRichEdit_AppendTextColor($Console, $Data, 0x00FF00)
	EndSwitch
	Return
EndFunc   ;==>_ConsoleWrite

Func _GUICtrlRichEdit_AppendTextColor($hWnd, $sText, $iColor, $Style = 0)
	Local $iLength = _GUICtrlRichEdit_GetTextLength($hWnd, True, True) ; RichEdit stores text as 2 Byte Unicode chars
	Local $iCp = _GUICtrlRichEdit_GetCharPosOfNextWord($hWnd, $iLength)
	_GUICtrlRichEdit_AppendText($hWnd, $sText)
	_GUICtrlRichEdit_SetSel($hWnd, $iCp - 1, $iLength + StringLen($sText)) ; position in 2 Byte "Unicode"
	_GUICtrlRichEdit_SetCharColor($hWnd, _ColorConvert($iColor))
	If $Style Then _GUICtrlRichEdit_SetCharAttributes($hWnd, $Style, True)
	_GUICtrlRichEdit_Deselect($hWnd)
EndFunc   ;==>_GUICtrlRichEdit_AppendTextColor

Func _ColorConvert($nColor);RGB to BGR or BGR to RGB
	Return _
			BitOR(BitShift(BitAND($nColor, 0x000000FF), -16), _
			BitAND($nColor, 0x0000FF00), _
			BitShift(BitAND($nColor, 0x00FF0000), 16))
EndFunc   ;==>_ColorConvert

Func SetListItem($Selected = 0)
	If Not IsDeclared("Selected") Then
		$sChosen = GUICtrlRead($hList)
	Else
		$sChosen = $Selected
	EndIf
	If $sChosen <> "" Then GUICtrlSetData($SearchBar, $sChosen)
	GUISetState(@SW_HIDE, $hlist_ui)
EndFunc   ;==>SetListItem

Func Monitor()
	AdlibUnRegister("Monitor")
	If (GUICtrlRead($SearchBar) <> "") And (GUICtrlRead($SearchBar) <> $sChosen) And Not (BitAND(WinGetState($hlist_ui), 2)) And ($sData <> "|") Then
		If GUICtrlRead($Tab1) = 0 Then GUISetState(@SW_SHOWNOACTIVATE, $hlist_ui)
	EndIf
	If GUICtrlRead($SearchBar) = "" Or Not ($iMatch_Count) And BitAND(WinGetState($hlist_ui), 2) Then
		GUISetState(@SW_HIDE, $hlist_ui)
		$iCurrIndex = -1
	EndIf
	If GUICtrlRead($SearchBar) <> $sCurr_Input Then
		CheckInputText()
		$sCurr_Input = GUICtrlRead($SearchBar)
	EndIf
EndFunc   ;==>Monitor

Func CheckInputText()
	$sData = "|" ; Start with delimiter so new data always replaces old
	Local $sInput = GUICtrlRead($SearchBar)
	$iMatch_Count = 0
	If $sInput <> "" Then
		For $I = 0 To UBound($asKeyWords) - 1
			If StringInStr($asKeyWords[$I], $sInput, 2) Then
				$sData &= $asKeyWords[$I] & "|"
				$iMatch_Count += 1
			EndIf
		Next
		If (StringLen($sData) < 2) Then Return;try to prevent uneeded flicker
		GUICtrlSetData($hList, $sData)

		; Change size of child GUI
		Local $iList_Height = $iMatch_Count * (_GUICtrlListBox_GetItemHeight($hList) + 1)
		If $iList_Height < 20 Then $iList_Height = 20
		If $iList_Height > 100 Then $iList_Height = 100

		Local $C = ControlGetPos($BANEVADER, "", $SearchBar)
		;GUISetState(@SW_LOCK, $BANEVADER)
		WinMove($hlist_ui, "", Default, Default, $C[2], $iList_Height)
		SetListStyle($hlist_ui, $hList)
		$iCurrIndex = -1
		_FixUI();Fix RichEditControl
		;GUISetState(@SW_UNLOCK, $BANEVADER)
		If (StringLen(GUICtrlRead($SearchBar)) > 5) Then
			_RegisterPrediction($hSearchBar, $asKeyWords, Default, 0)
		Else
			_UnRegisterPrediction()
		EndIf
	EndIf
EndFunc   ;==>CheckInputText

Func SetListStyle($hWnd, $ID)
	Local $Region = DllCall("gdi32.dll", "long", "CreateRectRgn", "long", 0, "long", 0, "long", 0, "long", 0)
	Local $CTRLPos = ControlGetPos($hWnd, '', $ID)
	Local $Region2 = DllCall("gdi32.dll", "long", "CreateRectRgn", "long", $CTRLPos[0], "long", $CTRLPos[1], "long", $CTRLPos[0] + $CTRLPos[2], "long", $CTRLPos[1] + $CTRLPos[3])
	DllCall("gdi32.dll", "long", "CombineRgn", "long", $Region[0], "long", $Region2[0], "long", $Region[0], "int", 2)
	DllCall($hUSER32, "long", "SetWindowRgn", "hwnd", $hWnd, "long", $Region[0], "int", 1)
EndFunc   ;==>SetListStyle

Func Keywords($Set = True)

	Local $sData, $Count, $aKeyWords, $Rows, $Columns

	If _SQLite_GetTable2d($hHistoryDataBase, "SELECT * FROM history ORDER BY bumped DESC;", $aKeyWords, $Rows, $Columns) = $SQLite_OK Then
		;_ArrayDisplay($aKeyWords)
		$Count = UBound($aKeyWords) - 1
		ReDim $asKeyWords[$Count + 1]
		If $Count Then
			If $Set Then GUICtrlSetData($SearchBar, $aKeyWords[1][1])
			$sChosen = $aKeyWords[1][1]
			For $I = 1 To $Count
				$asKeyWords[$I - 1] = $aKeyWords[$I][1]
				$sData &= $asKeyWords[$I] & "|"
			Next
		EndIf
	EndIf

	GUICtrlSetData($hList, $sData)
	$iCurrIndex = -1
	If $Set Then _GUICtrlListBox_SetCurSel($hList, $iCurrIndex)

EndFunc   ;==>Keywords

Func UP()
	Local $SelectedTab = GUICtrlRead($Tab1)
	If $SelectedTab = 0 Then
		$iCurrIndex -= 1
		If $iCurrIndex < 0 Then $iCurrIndex = 0
		_GUICtrlListBox_SetCurSel($hList, $iCurrIndex)
	ElseIf $SelectedTab = 1 And ($aItemSelected[0] > -1) Then
		If $aItemSelected[0] < 1 Then Return
		$aItemSelected[0] -= 1
		GUIRegisterMsg($WM_NOTIFY, ""); need to turn off this crap to prevent callback flooding
		_GUICtrlListView_ClickItem($ListView32, $aItemSelected[0], "Left", False, 1, 0)
		GUIRegisterMsg($WM_NOTIFY, "WM_NOTIFY")
	EndIf
EndFunc   ;==>UP

Func DOWN()
	Local $SelectedTab = GUICtrlRead($Tab1)
	If $SelectedTab = 0 Then
		Local $iTotal = _GUICtrlListBox_GetCount($hList)
		$iCurrIndex += 1
		If $iCurrIndex > $iTotal - 1 Then $iCurrIndex = $iTotal - 1
		_GUICtrlListBox_SetCurSel($hList, $iCurrIndex)
	ElseIf $SelectedTab = 1 And ($aItemSelected[0] > -1) Then
		If ((_GUICtrlListView_GetItemCount($ListView32) - 1) <= $aItemSelected[0]) Then Return
		$aItemSelected[0] += 1
		GUIRegisterMsg($WM_NOTIFY, "")
		_GUICtrlListView_ClickItem($ListView32, $aItemSelected[0], "Left", False, 1, 0)
		GUIRegisterMsg($WM_NOTIFY, "WM_NOTIFY")
	EndIf
EndFunc   ;==>DOWN

Func ENTER()
	Local $SelectedTab = GUICtrlRead($Tab1)
	If $SelectedTab = 0 Then
		Local $sText = _GUICtrlListBox_GetText($hList, $iCurrIndex)
		SetListItem($sText)
		$iCurrIndex = -1
		_GUICtrlListBox_SetCurSel($hList, $iCurrIndex)
		GUISetState(@SW_HIDE, $hlist_ui)
	ElseIf $SelectedTab = 1 Then
		If IsArray($aItemSelected) Then _GUICtrlListView_ClickItem($ListView32, $aItemSelected[0], "Left", False, 2, 0)
	EndIf
EndFunc   ;==>ENTER

Func DELETE()
	Local $SelectedTab = GUICtrlRead($Tab1)
	If $SelectedTab = 0 Then
		Local $sText = _GUICtrlListBox_GetText($hList, $iCurrIndex)
		_SQLite_Exec($hHistoryDataBase, "DELETE FROM history WHERE scanned=" & _SQLite_Escape($sText) & ";")
		$iCurrIndex = -1
		GUISetState(@SW_HIDE, $hlist_ui)
		Keywords(0);reset keywords
	ElseIf $SelectedTab = 1 Then

		If (UBound($aItemSelected) < 3) Then Return
		If $aItemSelected[0] = -1 Then Return
		If $aItemSelected[1] Then Return
		If Not $aItemSelected[0] And Not _GUICtrlListView_GetItemSelected($ListView32, 0) Then Return 0
		Local $IP = _GUICtrlListView_GetItemText($ListView32, $aItemSelected[0])
		If Not $IP Then Return 0

		Local $Split =StringSplit($IP, ":")
		If @error Then Return
		Local $Proxy = $Split[1], $Port = $Split[2]

		_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxy & "';")
		_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxy & "';")

		_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")

		_GUICtrlListView_DeleteItem($hListView32, $aItemSelected[0])
		Local $Count = _GUICtrlListView_GetItemCount($ListView32)
		_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & $Count, 1)
		$Count -= 1
		If ($aItemSelected[0] > $Count) Then $aItemSelected[0] -= 1
		_GUICtrlListView_ClickItem($ListView32, $aItemSelected[0], "Left", False, 1, 0)
	EndIf
EndFunc   ;==>DELETE

Func HELP()
	Local $Helptxt
	If $ISCompiled Then
		$Helptxt = _ResourceGetAsRaw(@ScriptFullPath, 10, "HELP", 1033, 0)
	Else
		$Helptxt = FileRead(".\readme.rtf")
	EndIf
	_GUICtrlRichEdit_SetText($Console, $Helptxt)
EndFunc   ;==>HELP

Func _SET_STATE_UseCustomUserAgent()
	Local $State = GUICtrlRead($UseCustomUserAgent)
	Switch $State
		Case 1
			GUICtrlSetState($CustomUserAgent, $GUI_ENABLE)
		Case 4
			GUICtrlSetState($CustomUserAgent, $GUI_DISABLE)
	EndSwitch
	Return 1
EndFunc   ;==>_SET_STATE_UseCustomUserAgent

Func _SET_STATE_PruneProxies()
	Local $State = GUICtrlRead($PruneProxies)
	Switch $State
		Case 1
			GUICtrlSetState($PruneDays, $GUI_ENABLE)
			GUICtrlSetState($USER_MAX_LIMIT, $GUI_ENABLE)
		Case 4
			GUICtrlSetState($PruneDays, $GUI_DISABLE)
			GUICtrlSetState($USER_MAX_LIMIT, $GUI_DISABLE)
	EndSwitch
	Return 1
EndFunc   ;==>_SET_STATE_PruneProxies

Func _SET_STATE_IPRegExpSetting()
	Local $State = GUICtrlRead($IPRegExpSetting)
	Switch $State
		Case 1
			GUICtrlSetState($IPRegExp, $GUI_ENABLE)
		Case 4
			GUICtrlSetState($IPRegExp, $GUI_DISABLE)
	EndSwitch
	Return 1
EndFunc   ;==>_SET_STATE_IPRegExpSetting

Func SetSelected()

;~ 	$ItemSelected = _GUICtrlListView_HitTest($hListView32)
;~ 	If @error Or (UBound($ItemSelected) < 3) Then Return
;~ 	$ItemSelected = $ItemSelected[0]

;~ 	Local $sProxy = _GUICtrlListView_GetItemText($hListView32, $ItemSelected, 0)
	Local $CTRL = FetchListViewEntry($ListView32, 0)
	If @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Status: Proxy disabled", 0)
		Return _SetProxyData()
	EndIf
	GUICtrlSetBkColor($CTRL[1], 0xE3DEFF)

	If $hCurrentUsedProxyEntry <> $CTRL[1] Then
		;GUICtrlSetBkColor($hCurrentUsedProxyEntry, 0xFFFFFF)
		_Set_ISP_Ban_Probability_Color($hCurrentUsedProxyEntry)
	EndIf

	$hCurrentUsedProxyEntry = $CTRL[1]
	_SetProxyData($CTRL[0])
EndFunc   ;==>SetSelected

Func ClearList()
	_GUICtrlListView_DeleteAllItems($hListView32)
	_SQLite_Exec($hProxyDataBase, "DROP TABLE listviewitems;")
	_SQLite_Exec($hProxyDataBase, "CREATE TABLE listviewitems (proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));")
EndFunc   ;==>ClearList

Func CopyProxiesToClipBoard()
	Local $ItemCount = _GUICtrlListView_GetItemCount($ListView32)
	Local $Name
	For $I = 0 To $ItemCount
		$Name &= _GUICtrlListView_GetItemText($ListView32, $I, 0) & @CRLF
	Next
	ClipPut($Name)
	_ConsoleWrite(">All proxies copied to clipboard!" & @CR, 15, 0x00FF00)
EndFunc   ;==>CopyProxiesToClipBoard

Func SaveSelected()
	Local $IP, $Count = 0
	For $I = 0 To _GUICtrlListView_GetItemCount($ListView32)
		If _GUICtrlListView_GetItemSelected($ListView32, $I) Then
			$IP &= _GUICtrlListView_GetItemText($ListView32, $I) & @CRLF
			$Count += 1
		EndIf
	Next
	_GUICtrlStatusBar_SetText($hStatusBar, $Count & " proxies copied to clipboard!", 0)
	ClipPut($IP)
	_ConsoleWrite(">" & $Count & " proxies copied to clipboard!" & @CR, 12, 0x00FF00)
EndFunc   ;==>SaveSelected

Func ProxySettings()
	GUISetState(@SW_SHOW, $ProxySettingsGUI)
EndFunc   ;==>ProxySettings

Func ProxySettingsCloseGUI()
	GUISetState(@SW_HIDE, $ProxySettingsGUI)
EndFunc   ;==>ProxySettingsCloseGUI

Func _BanCkeckUIShow()
	GUISetState(@SW_SHOW, $reCaptcha_UI)
EndFunc

Func _BanCheckUIHide()
	GUISetState(@SW_HIDE, $reCaptcha_UI)
	$StopOperation = 1
EndFunc

Func RestoreProxyBlacklist()
	$ProxyOverRide = $ProxyOverRide_backup
	If Not _SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape($ProxyOverRide) & " WHERE setting='ProxyOverRide';") = $SQLite_OK Then
		_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ProxyOverRide','1'," & _SQLite_Escape($ProxyOverRide) & ");")
	EndIf
	GUICtrlSetData($ProxyBlackList, $ProxyOverRide)
EndFunc   ;==>RestoreProxyBlacklist

Func _SetProxyData($Proxy = 0)
	Local $reg, $reg1, $key = "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
	If @OSArch <> "X86" Then $key = "HKEY_CURRENT_USER64\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
	Local $Temp

	$BanCheckResetQue = True

	If Not $Proxy Then
		$reg = RegWrite($key, "ProxyEnable", "REG_DWORD", "0")
		$reg1 = RegWrite($key, "ProxyServer", "REG_SZ", "")
		RegWrite($key, "ProxyOverride", "REG_SZ", "")
		GUICtrlSetBkColor($hCurrentUsedProxyEntry, 0xADADAD); remove highlight if any

		_GUICtrlStatusBar_SetText($hStatusBar, "Status: No proxy in use. Double click a proxy to use.", 0)

		If $Proxy_Used[0] Then
			_ConsoleWrite(@HOUR & ":" & @MIN & "." & @SEC & " Disabled Proxy: " & $Proxy_Used[1] & @CR, "", 0xFFCC00); random color stuff
		Else
			_ConsoleWrite(@HOUR & ":" & @MIN & "." & @SEC & " No proxy set." & @CR, "", 0xFFCC00); random color stuff
		EndIf

		$Proxy_Used[0] = 0
	Else

		$reg = RegWrite($key, "ProxyEnable", "REG_DWORD", "1")
		$reg1 = RegWrite($key, "ProxyServer", "REG_SZ", $Proxy)
		RegWrite($key, "ProxyOverride", "REG_SZ", $ProxyOverRide)

		Local $IP = StringSplit($proxy, ":")
		If Not @error Then $IP = $IP[1]

		$Temp = DllCall($hMSVCRT, "int:cdecl", "time", "int", 0)
		_SQLite_Exec($hProxyDataBase, "UPDATE topnotch SET bumped='" & $Temp[0] & "' WHERE proxy='" & $IP & "';")
		$Proxy_Used[0] = 1
		$Proxy_Used[1] = $Proxy

		_GUICtrlStatusBar_SetText($hStatusBar, @HOUR & ":" & @MIN & "." & @SEC & " Enabled: " & $Proxy, 0)
		_ConsoleWrite(@HOUR & ":" & @MIN & "." & @SEC & " Enabled Proxy: " & $Proxy & @CR, "", 0xFFCC00); random color stuff

		If GUICtrlRead($TestBannedPage) = $GUI_CHECKED Then
			AdlibRegister("_Proxy_BanPage_Check", 1500)
			$EnguageBanChecks = True
		EndIf

	EndIf
	If Not($reg) Or Not($reg1) Then MsgBox(16, "Error!", "Something went wrong while trying to set the proxy, maybe permissions.")
	DllCall('WININET.DLL', 'long', 'InternetSetOption', 'int', 0, 'long', 39, 'str', 0, 'long', 0); tell the browser there was a change
	Return
EndFunc   ;==>_SetProxyData

;in the case of a responsive proxy, i should probably do something to limate the speed of the connections
;say the request was made an responce is immediate, this funcion will immediately create a new request and effectively flood the proxy, not good not good.
Func _Proxy_BanPage_Check()

	If GUICtrlRead($TestBannedPage) = $GUI_UNCHECKED Then
		AdlibUnRegister("_Proxy_BanPage_Check")
		$EnguageBanChecks = False
	EndIf

	Local $tInfo, $iI, $Message, $Request, $Temp
	Local Static $BanchecksMax = 15
	Local Static $WaitMax = 10
	Local Const $PROXY_STRING = 0, $PROXY_THREAD = 1, $PROXY_POSTSTRUC = 2, $PROXY_STATS = 3, $PROXY_INGET = 4, $PROXY_CONNECTIONS = 5, $PROXY_CONNECTIONCHECKS = 6, $PROXY_TIMER = 7
	Local $Exists = False, $Alive = false, $Index = 0

	If Not $Proxy_Used[0] Or $BanCheckResetQue Then

		$BanCheckResetQue = False

		If Not $Proxy_Used[0] Then
			AdlibUnRegister("_Proxy_BanPage_Check")
			$EnguageBanChecks = False
			_ConsoleWrite("Periodic banchecks have ended for proxy(s)." & @CR)
			For $I = 0 To 9

				If IsDllStruct($aPROXIES[$I][$PROXY_POSTSTRUC]) Then

					_WinHttpCloseHandle(DllStructGetData($aPROXIES[$I][$PROXY_POSTSTRUC], "httpRequest"))
					_WinHttpCloseHandle(DllStructGetData($aPROXIES[$I][$PROXY_POSTSTRUC], "httpConnect"))
					_WinHttpCloseHandle(DllStructGetData($aPROXIES[$I][$PROXY_POSTSTRUC], "httpSession"))

				EndIf

				DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aPROXIES[$I][$PROXY_THREAD], 'DWORD*', 0)
				DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $aPROXIES[$I][$PROXY_THREAD])

				$aPROXIES[$I][$PROXY_STATS] = 0
				$aPROXIES[$I][$PROXY_INGET] = 0
				$aPROXIES[$I][$PROXY_TIMER] = 0
				$aPROXIES[$I][$PROXY_STRING] = 0
				$aPROXIES[$I][$PROXY_POSTSTRUC] = 0
				$aPROXIES[$I][$PROXY_CONNECTIONS] = 0
				$aPROXIES[$I][$PROXY_CONNECTIONCHECKS] = 0
			Next

			Return

		Else
			_ConsoleWrite("Monitoring ban status for " & $Proxy_Used[1] & @CR)

			For $I = 0 To 9
				If ($aPROXIES[$I][$PROXY_STRING] = $Proxy_Used[1]) Then
					$Exists = True
					$Index = $I
				EndIf
			Next

			If Not $Exists Then
				For $I = 0 To 9
					If $aPROXIES[$I][$PROXY_STATS] = 0 Then
						$aPROXIES[$I][$PROXY_STRING] = $Proxy_Used[1]
						$aPROXIES[$I][$PROXY_STATS] = 1
						$aPROXIES[$I][$PROXY_INGET] = 0
						$aPROXIES[$I][$PROXY_TIMER] = 0
						$aPROXIES[$I][$PROXY_CONNECTIONS] = 0
						$aPROXIES[$I][$PROXY_CONNECTIONCHECKS] = 0
						ExitLoop
					EndIf
				Next
			Else
				$aPROXIES[$Index][$PROXY_CONNECTIONS] = 0
				$aPROXIES[$Index][$PROXY_CONNECTIONCHECKS] = 0
				$aPROXIES[$Index][$PROXY_TIMER] = 0
			EndIf

		EndIf

	EndIf

	For $i = 0 to 9
		If $aPROXIES[$I][$PROXY_STATS] Then
			$Alive = True
			Switch $aPROXIES[$I][$PROXY_INGET]
				Case 1

					$Request = DllStructGetData( $aPROXIES[$I][$PROXY_POSTSTRUC], "ResponceHTML")

					If $Request Then

						DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aPROXIES[$I][$PROXY_THREAD], 'DWORD*', 0)
						DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE',  $aPROXIES[$I][$PROXY_THREAD])

						$Message = _ExtractMessage($Request)
						_ConsoleWrite("	+>Request sucess: " & StringRegExpReplace($Message, "\r\n", " ") & @CR)

						$aPROXIES[$I][$PROXY_INGET] = 0

						$tInfo = DllStructCreate($tagLVFINDINFO)

						If ($Message == 'captcha') Then

							DllStructSetData($tInfo, "Flags", $LVFI_STRING)
							$iI = _GUICtrlListView_FindItem($ListView32, -1, $tInfo, $aPROXIES[$I][$PROXY_STRING])
							$Temp = _GUICtrlListView_GetItem($ListView32, $iI, 3)
							$Temp = $Temp[2]
							If StringInStr($Temp, "banned") Then
								If Not StringInStr($Temp, "[REQUIRES CAPTCHA]") Then
									_GUICtrlListView_SetItem($ListView32, "[REQUIRES CAPTCHA] - " & $Temp, $iI, 3)
								EndIf
							Else
								_GUICtrlListView_SetItem($ListView32, "You must solve the CAPTCHA in order to view your IP's ban status. " & @CRLF & "Try posting with this proxy in order to find out if it's banned or not. " & @CRLF & "Once you have posted, you will see the message here.", $iI, 3)
							EndIf
						Else
							$aPROXIES[$I][$PROXY_STATS] = 0

							DllStructSetData($tInfo, "Flags", $LVFI_STRING)
							$iI = _GUICtrlListView_FindItem($ListView32, -1, $tInfo, $aPROXIES[$I][$PROXY_STRING])
							_GUICtrlListView_SetItem($ListView32, $Message, $iI, 3)


						EndIf
						ContinueLoop
					Else

						If $aPROXIES[$I][$PROXY_CONNECTIONCHECKS] > $WaitMax Then
							DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aPROXIES[$I][$PROXY_THREAD], 'DWORD*', 0)
							DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $aPROXIES[$I][$PROXY_THREAD])
							$aPROXIES[$I][$PROXY_INGET] = 0
							_ConsoleWrite("!->Connection wait limate reached: " & $aPROXIES[$I][$PROXY_CONNECTIONCHECKS] & @CR)
						Else
							_ConsoleWrite("	->Connecting...: " & $aPROXIES[$I][$PROXY_CONNECTIONCHECKS] & @CR)
							$aPROXIES[$I][$PROXY_CONNECTIONCHECKS] += 1
							ContinueLoop
						EndIf

					EndIf

					If $aPROXIES[$I][$PROXY_CONNECTIONS] > $BanchecksMax Then

						DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE',  $aPROXIES[$I][$PROXY_THREAD], 'DWORD*', 0)
						DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE',  $aPROXIES[$I][$PROXY_THREAD])

						$aPROXIES[$I][$PROXY_STATS] = 0
						$aPROXIES[$I][$PROXY_INGET] = 0
						$aPROXIES[$I][$PROXY_TIMER] = 0
						$aPROXIES[$I][$PROXY_STRING] = 0
						$aPROXIES[$I][$PROXY_POSTSTRUC] = 0
						$aPROXIES[$I][$PROXY_CONNECTIONS] = 0
						$aPROXIES[$I][$PROXY_CONNECTIONCHECKS] = 0

						_ConsoleWrite("!>Connection check limate reached for " & $aPROXIES[$I][$PROXY_STRING] &  @CR)

					Else
						$aPROXIES[$I][$PROXY_CONNECTIONS] += 1
						$aPROXIES[$I][$PROXY_CONNECTIONCHECKS] = 0
						_ConsoleWrite(">Reconnecting for (" & $aPROXIES[$I][$PROXY_CONNECTIONS] & ") time on = " & $aPROXIES[$I][$PROXY_STRING] &  @CR)
					EndIf

				Case Else

					If (TimerDiff($aPROXIES[$I][$PROXY_TIMER]) > 15000) or Not($aPROXIES[$I][$PROXY_TIMER]) Then

						Local $headers = _
							"Connection: Keep-alive" & @CRLF & _
							"Accept: */*" & @CRLF & _
							"Accept-Encoding: *;q=0" & @CRLF

						#Region - MT Request -

						Local $tURL_COMPONENTS = DllStructCreate($tagTHREAD_PARAMETERS)

						DllStructSetData($tURL_COMPONENTS, "UserAgent", $UserAgentString)
						DllStructSetData($tURL_COMPONENTS, "HTTPVerb", "GET")
						DllStructSetData($tURL_COMPONENTS, "Host", "www.4chan.org")
						DllStructSetData($tURL_COMPONENTS, "Resource", "banned")
						DllStructSetData($tURL_COMPONENTS, "Port", $INTERNET_DEFAULT_HTTPS_PORT)

						DllStructSetData($tURL_COMPONENTS, "Referer", '')
						DllStructSetData($tURL_COMPONENTS, "Headers", $headers)
						DllStructSetData($tURL_COMPONENTS, "ExtraData", "")

						DllStructSetData($tURL_COMPONENTS, "Length", 0)
						DllStructSetData($tURL_COMPONENTS, "TotalLength", 0)

						DllStructSetData($tURL_COMPONENTS, "dwResolveTimeout", 30000)
						DllStructSetData($tURL_COMPONENTS, "dwConnectTimeout", 30000)
						DllStructSetData($tURL_COMPONENTS, "dwSendTimeout", 30000) ; 15 seconds
						DllStructSetData($tURL_COMPONENTS, "dwReceiveTimeout", 30000)

						DllStructSetData($tURL_COMPONENTS, "Proxy", $aPROXIES[$I][$PROXY_STRING])
						DllStructSetData($tURL_COMPONENTS, "ProxyFlags", $WINHTTP_ACCESS_TYPE_NAMED_PROXY)
						DllStructSetData($tURL_COMPONENTS, "SendFlags", BitOR($WINHTTP_FLAG_SECURE, $WINHTTP_FLAG_ESCAPE_DISABLE))

						DllStructSetData($tURL_COMPONENTS, "RetryTimes", 3)
						DllStructSetData($tURL_COMPONENTS, "MaxTestTime", 30)

						; finally. create the thread and send it the structure and tell it what type of method to use
						;FileWrite(".\Added.txt", @HOUR & ":" & @MIN & ":" & @SEC & ":" & @MSEC & @TAB & "ScanLevel (" & $Level & ")" & @TAB & @TAB & "IP (" & $Proxies[$X][1] & ")" & @CRLF)
						$aPROXIES[$I][$PROXY_THREAD] = CheckProxyInAnotherThread(DllStructGetPtr($tURL_COMPONENTS))

						#EndRegion - MT Request -

						If @error Then
							$tURL_COMPONENTS = 0
							Return SetError(2, 0, 0)
						EndIf

						_ConsoleWrite("+>Created Request with: " & $aPROXIES[$I][$PROXY_STRING] & @CR)

						$aPROXIES[$I][$PROXY_STATS] = 1
						$aPROXIES[$I][$PROXY_INGET] = 1
						$aPROXIES[$I][$PROXY_POSTSTRUC] = $tURL_COMPONENTS
						$aPROXIES[$I][$PROXY_TIMER] = TimerInit()
					Else
						_ConsoleWrite("		!->Delaying connections for ("&$aPROXIES[$I][$PROXY_STRING]&") until ("& (15000 - Int(TimerDiff($aPROXIES[$I][$PROXY_TIMER]))) & ") MiliSeconds." & @CR)
					EndIf
			EndSwitch
		EndIf
	Next

	If Not $Alive Then
		AdlibUnRegister("_Proxy_BanPage_Check")
		$EnguageBanChecks = False
		_ConsoleWrite(">Ban checks have been discontinued." & @CR)
	EndIf

EndFunc

Func GetClipBoardProxies()
	AdlibUnRegister("GetClipBoardProxies")

	GUISetState(@SW_HIDE, $hlist_ui)

	$IsInOperation = 1
	$StopOperation = 0
	$Crawled = 1
	$ClipboardActivated = 1

	GUICtrlSetData($ClipBoard, "Stop")
	GUICtrlSetState($TestButton, $GUI_DISABLE)
	GUICtrlSetState($SCANBUTTON, $GUI_DISABLE)

	_ConsoleWrite(">Searching for proxies in clipboard!" & @CR, 14)
	SaveProxies(StringReplace(StringStripWS(ClipGet(), 4), @TAB, ":"))
	If @error Then _ConsoleWrite("!>Nothing found ;_;" & @CR)
	GUICtrlSetState($TestButton, $GUI_ENABLE)
	GUICtrlSetState($SCANBUTTON, $GUI_ENABLE)
	GUICtrlSetData($ClipBoard, "ClipBoard")

	$IsInOperation = 0
	$StopOperation = 0
	$ClipboardActivated = 0

	Return 1
EndFunc   ;==>GetClipBoardProxies

Func Harvest()
	AdlibUnRegister("Harvest")

	GUISetState(@SW_HIDE, $hlist_ui)
	Local $SearchTerm = GUICtrlRead($SearchBar)

	$IsInOperation = 1
	$StopOperation = 0
	$Crawled = 1

	GUICtrlSetData($TestType, "New")

	GUICtrlSetData($SCANBUTTON, "Stop")
	GUICtrlSetState($TestButton, $GUI_DISABLE)
	GUICtrlSetState($ClipBoard, $GUI_DISABLE)

	If Not $SearchTerm Then
		_ConsoleWrite(">Searching for proxies in clipboard!" & @CR, 14)
		SaveProxies(StringReplace(StringStripWS(ClipGet(), 4), @TAB, ":"))
		If @error Then
			_ConsoleWrite("->Nothing found!" & @CR)
			Sleep(1000)
			_ConsoleWrite("~>BanBuster: Auto-Mode initiated-" & @CR, 9)
			Sleep(1500)
			_ConsoleWrite("~>Auto-BanBuster: Scanning for proxies-" & @CR, 9)
			_ScanHideMyAss()
			If $Found Then
				_ConsoleWrite("~>Auto-BanBuster: Found " & $Found & "-" & @CR, 9)
				If $StopOperation Then
					_ConsoleWrite(@CR & "!>Auto-BanBuster: Aborting operations-" & @CR, 9)
					_ConsoleWrite("~>BanBuster: Auto-Mode disengaged~" & @CR, 9)
				Else
					_ConsoleWrite(@CR & "~>Auto-BanBuster: Initializing tests-" & @CR, 9)
					$Crawled = 1
					GUICtrlSetState($TestButton, $GUI_ENABLE)
					GUICtrlSetData($TestButton, "Stop Test")
					GUICtrlSetState($TesterTab, $GUI_SHOW); switch tab to the testing tab
					; when switching like this, we need to tell bb to call some function from our script to fix the GUI for us.
					DllCall($hUSER32, "lresult", "SendMessage", "hwnd", WinGetHandle($BANEVADER), "uint", $WM_SIZE, "wparam", 0, "lparam", 0)
					_Initialize_Proxt_Tests()
					_ConsoleWrite("~>BanBuster: Auto-Mode disengaged~" & @CR, 9)
				EndIf
			Else
				_ConsoleWrite("!>Auto-BanBuster: Aborting operation-" & @CR, 9)
				Sleep(2000)
				_ConsoleWrite("->Auto-BanBuster: No proxies found ;_;" & @CR, 9)
				_ConsoleWrite("~>BanBuster: Auto-Mode disengaged~" & @CR, 9)
			EndIf
		EndIf
	Else
		Local $sSerch = _SQLite_Escape($SearchTerm), $info
		Local $Bump = DllCall($hMSVCRT, "int:cdecl", "time", "int", 0)

		_SQLite_QuerySingleRow($hHistoryDataBase, "SELECT scanned FROM history WHERE scanned=" & $sSerch & ";", $info)
		If UBound($info) > 0 Then $info = $info[0]
		If $info <> "" Then
			_SQLite_Exec($hHistoryDataBase, "UPDATE history SET bumped='" & $Bump[0] & "' WHERE scanned=" & $sSerch & "")
		Else
			_SQLite_Exec($hHistoryDataBase, "INSERT INTO history (scanned, bumped) VALUES (" & $sSerch & ",'" & $Bump[0] & "');")
			Keywords();reset keywords to include newly set value
		EndIf

		_WinHttpCrackUrl($SearchTerm)
		If @error Then
			_ConsoleWrite(">Searching for proxies in google links!" & @CR, 14)
			_GoogleSearch($SearchTerm)
		Else
			_ScanDomain($SearchTerm, 1)
		EndIf
	EndIf

	GUICtrlSetState($TestButton, $GUI_ENABLE)
	GUICtrlSetState($ClipBoard, $GUI_ENABLE)
	GUICtrlSetData($SCANBUTTON, "Scan")
	GUICtrlSetData($TestButton, "Test Proxies")

	$IsInOperation = 0
	$StopOperation = 0

	Return 1
EndFunc   ;==>Harvest

Func _Initialize_Proxt_Tests()
	AdlibUnRegister("_Initialize_Proxt_Tests")

	$IsInOperation = 1
	$StopOperation = 0

	GUISetState(@SW_HIDE, $hlist_ui)
	GUICtrlSetData($TestButton, "Stop")
	GUICtrlSetState($SCANBUTTON, $GUI_DISABLE)
	GUICtrlSetState($ClipBoard, $GUI_DISABLE)

	MultiThreadedProxyTest() ; use the DLL for Multi-Threading..

	GUICtrlSetState($SCANBUTTON, $GUI_ENABLE)
	GUICtrlSetState($ClipBoard, $GUI_ENABLE)
	GUICtrlSetData($TestButton, "Test Proxies")

	$IsInOperation = 0
	$StopOperation = 0
	$Crawled = 0

	Return
EndFunc   ;==>_Initialize_Proxt_Tests

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

Func ToolTipsManager()
	; this poorly manages tool tips for the list view ban messages
	#cs
		$ItemSelected[]

		[0] - Zero based index of the item at the specified position, or -1
		[1] - If True, position is in control's client window but not on an item
		[2] - If True, position is over item icon
		[3] - If True, position is over item text
		[4] - If True, position is over item state image
		[5] - If True, position is somewhere on the item
		[6] - If True, position is above the control's client area
		[7] - If True, position is below the control's client area
		[8] - If True, position is to the left of the client area
		[9] - If True, position is to the right of the client area
	#ce

	$ItemSelected = _GUICtrlListView_HitTest($hListView32)
	If @error Or (UBound($ItemSelected) < 3) Then Return

	If $ItemSelected[0] = -1 Then
		$LastHovered = -1
		Return ToolTip("")
	EndIf

	If $ItemSelected[1] Then Return ToolTip("")
	$ItemSelected = $ItemSelected[0]

	Local $sToolTipData = _GUICtrlListView_GetItemText($hListView32, $ItemSelected, 3)

	If Not $sToolTipData Then Return
	Local $Mypos = StringInStr($sToolTipData, @LF)

	If ($Mypos > 0) And $OkForToolTips And ($LastHovered <> $ItemSelected) Then
		;$sToolTipData = _Stringformat($sToolTipData)
		If WinActive($BANEVADER) Then
			ToolTip($sToolTipData, MouseGetPos(0) + 10, MouseGetPos(1) + 10, "Proxy Info", 1, 4 + 1)
		Else
			$OkForToolTips = False
		EndIf

		$LastHovered = $ItemSelected
	ElseIf ($LastHovered <> $ItemSelected) Then
		$LastHovered = $ItemSelected
		ToolTip("")
	EndIf
EndFunc   ;==>ToolTipsManager

Func _Stringformat($String)
	Local $str, $Array = StringRegExp($String, '(?ms)(?:.{0,75})', 3)
	For $I = 0 To UBound($Array) - 1
		$str &= $Array[$I] & @CRLF
	Next
	Return $str
EndFunc   ;==>_Stringformat

Func CheckDroppedFiles()
	AdlibUnRegister("CheckDroppedFiles")
	If IsArray($aFilename) Then
		For $I = 0 To UBound($aFilename) - 1
			If FileExists($aFilename[$I]) Then
				If FileGetSize($aFilename[$I]) > 3145728 Then
					If MsgBox(4 + 48 + 256 + 262144, "Warning!", "File: " & $aFilename[$I] & @CR & @CR & _
							"It's pretty damn fucking huge, you really sure you wana check for proxies in there? It might take really long..." & @CR & _
							"You can always just press the [s] key to stop though..") = 7 Then ContinueLoop
				EndIf
				_ConsoleWrite("~>Checking " & $aFilename[$I] & " for proxies." & @CR, 15)
				$aFilename[$I] = FileRead($aFilename[$I])
				If IsBinary($aFilename[$I]) Then $aFilename[$I] = BinaryToString($aFilename[$I])
				SaveProxies($aFilename[$I])
				$aFilename[$I] = 0
			EndIf
		Next
	EndIf
	ReDim $aFilename[1]
	$aFilename[0] = 0
	_ConsoleWrite("+>Operation compleated." & @CR, 15)
EndFunc   ;==>CheckDroppedFiles

#endregion - USER INTERFACE -

#region - WM_MESSAGES -
; also UI code, we mostly use windows messages because it lets us break through function execution no matter what

; #FUNCTION# ====================================================================================================================
; Name ..........: WM_COMMAND
; Description ...: Handles basic GUI stuff immediatly, using this function, we make the GUI much better by allowing user requested
;					|actions to happen regardless if there is already another function running.
; Author ........: ???
; Modified ......: DeputyDerp aka ScriptKitty
; Remarks .......: IMPORTANT! Try not to call a function that will remain in execution for a good while from this function
;						|In order to keep the UI responsive, we need to use adlibregister to call a function to we can
;						|stop its operation in real time.
; ===============================================================================================================================
Func WM_COMMAND($hWnd, $iMsg, $iwParam, $ilParam)
	#forceref $hwnd, $iMsg

	Local $iCode = BitShift($iwParam, 16)
	Local $iIDFrom = BitAND($iwParam, 0x0000FFFF)

	;ConsoleWrite("WM_CCCOMMAND" & @CR)
	Switch $hWnd
		Case $reCaptcha_UI
			Switch $iCode
				Case 0
					AdlibRegister("_GetNewCaptcha", 400)
					Return 'GUI_RUNDEFMSG'
			EndSwitch

		Case $BANEVADER
			Switch $ilParam
				Case $hSearchBar
					Switch $iCode
						Case $EN_CHANGE ; Sent when the user has taken an action that may have altered text in an edit control
							AdlibRegister("Monitor", 200)
							Return $GUI_RUNDEFMSG
;~                 Case $EN_KILLFOCUS  ; Sent when an edit control loses the keyboard focus
;~ 					AdlibRegister("HideCTRL",200)
					EndSwitch

			EndSwitch
			Switch $iIDFrom
				Case $UseProxy
					SetSelected()

				Case $RemoveProxy
					_SetProxyData()

				Case $CopySelected
					SaveSelected()

				Case $CopyAll
					CopyProxiesToClipBoard()

				Case $ClearProxies
					ClearList()

				Case $DeleteProxySelected
					DeleteProxy()

				Case $BlacklistProxyISP
					BlacklistProxyISP()

				Case $BlacklistProxyCountry
					BlacklistProxyCountry()

				Case $DeleteProxyByCountry
					DeleteProxyByCountry()

				Case $ActivateProxySettings
					ProxySettings()

				Case $ActivateBanChecks
					_ProxyBanCheck()

				Case $TestProxy
					If Not $IsInOperation Then AdlibRegister("TestProxy", 250)

				Case $GlobalSettingsSave, $GlobalSettingsSave2; save all settings
					SetUserSettings()

				Case $ResetProxyDeadlist
					If Not $IsInOperation Then
						If _SQLite_Exec($hProxyDataBase, "DROP TABLE dead;") = $SQLITE_OK Then
							If _SQLite_Exec($hProxyDataBase, "CREATE TABLE dead (proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));") = $SQLITE_OK Then
								_ConsoleWrite("~>The proxy deadlist has been pruned!" & @CR)
							Else
								_ConsoleWrite("!>Error in deadlist table recreation!" & @CR)
							EndIf
						Else
							_ConsoleWrite("~>Error in dropping deadlist database table ;_;" & @CR)
						EndIf
					Else
						_ConsoleWrite("!>BanBuster is currently working on the database, try again later!" & @CR)
					EndIf

				Case $ResetGoogleSearchHistory
					If Not $IsInOperation Then
						If _SQLite_Exec($hHistoryDataBase, "DROP TABLE google_searched;") = $SQLITE_OK Then
							If _SQLite_Exec($hHistoryDataBase, "CREATE TABLE google_searched (id INTEGER,url TEXT, PRIMARY KEY (id), UNIQUE (url));") = $SQLITE_OK Then
								_ConsoleWrite("~>The proxy deadlist has been pruned!" & @CR)
							Else
								_ConsoleWrite("!>Error in google_searched table recreation!" & @CR)
							EndIf
						Else
							_ConsoleWrite("~>Error in dropping google_searched database table ;_;" & @CR)
						EndIf
					Else
						_ConsoleWrite("!>BanBuster is currently working on the database, try again later!" & @CR)
					EndIf

				Case $TestButton
					Switch $IsInOperation
						Case True
							$StopOperation = 1
						Case False
							AdlibRegister("_Initialize_Proxt_Tests", 50);using this method to call the function we are able to stop it using the same button
							;if we call the function by using the func name, then AutoIt gets stuck in this function and cannot recall itself!
					EndSwitch

				Case $EnterChat

					Switch @Compiled
						Case 1
							Run(@ScriptFullPath & " /chat")
						Case 0
							Run(FileGetShortName(@AutoItExe) & ' /AutoIt3ExecuteScript ' & FileGetShortName(@ScriptFullPath) & " /chat")
					EndSwitch

				Case $SCANBUTTON
					Switch $IsInOperation
						Case True
							$StopOperation = 1
						Case False
							AdlibRegister("Harvest", 50)
					EndSwitch

				Case $ClipBoard
					Switch $IsInOperation
						Case True
							$StopOperation = 1
						Case False
							AdlibRegister("GetClipBoardProxies", 50)
					EndSwitch

			EndSwitch
		Case $ProxySettingsGUI
			Switch BitAND($iwParam, 0x0000FFFF)
				Case $SettingsSave
					SetUserSettings()
					GUISetState(@SW_HIDE, $ProxySettingsGUI)
				Case $SettingsRestore
					RestoreProxyBlacklist()
			EndSwitch
	EndSwitch
	;ConsoleWrite($iMsg&@CR)
	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_COMMAND

Func WM_NOTIFY($hWnd, $iMsg, $iwParam, $ilParam)
	#forceref $hWnd, $iMsg, $iwParam
	Local $tNMHDR = DllStructCreate($tagNMHDR, $ilParam)
	Local $hWndFrom = HWnd(DllStructGetData($tNMHDR, "hWndFrom"))
	;Local $iIDFrom = DllStructGetData($tNMHDR, "IDFrom")
	Local $iCode = DllStructGetData($tNMHDR, "Code")

	Switch $hWndFrom
		Case $hListView32
			Switch $iCode
				Case $NM_DBLCLK ; Sent by a list-view control when the user double-clicks an item with the left mouse button
					SetSelected()

				Case $NM_RCLICK, $NM_CLICK
					ToolTip(""); delete any existing tooltips
					$aItemSelected = _GUICtrlListView_HitTest($hListView32)

				Case $NM_SETFOCUS
					$OkForToolTips = True
					AdlibRegister("ToolTipsManager", 1000)

				Case $NM_KILLFOCUS
					ToolTip("")
					$OkForToolTips = False
					AdlibUnRegister("ToolTipsManager")

;~ 				Case $LVN_COLUMNCLICK ; A column was clicked
;~ 					Local $tInfo = DllStructCreate($tagNMLISTVIEW, $ilParam)
;~ 					;ConsoleWrite("!>CLICKD COLUMN!" & @CR)
;~ 					; Kick off the sort callback
;~ 					_GUICtrlListView_SortItems($hWndFrom, $tInfo)
;~ 					; No return value

			EndSwitch
	EndSwitch
	;ConsoleWrite($iCode&@CR)
	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_NOTIFY

Func WM_GETMINMAXINFO($hWnd, $iMsg, $WPARAM, $LPARAM)
	#forceref $hwnd, $iMsg, $WPARAM
	Local $tagMaxinfo = DllStructCreate("int;int;int;int;int;int;int;int;int;int", $LPARAM)
	DllStructSetData($tagMaxinfo, 7, $GUIMINWID + 5) ; min X
	DllStructSetData($tagMaxinfo, 8, $GUIMINHT + 25) ; min Y
	DllStructSetData($tagMaxinfo, 9, 99999) ; max X
	DllStructSetData($tagMaxinfo, 10, 99999) ; max Y
	GUISetState(@SW_HIDE, $hlist_ui)
	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_GETMINMAXINFO

Func WM_SIZE($hWnd, $iMsg, $iwParam, $ilParam)
	#forceref $hwnd, $iMsg, $iwParam
	;Local $iWidth = BitAND($ilParam, 0xFFFF) ; _WinAPI_LoWord; inacurate on startup for some reason...
	Local $iHeight = BitShift($ilParam, 16) ; _WinAPI_HiWord
	Local $CWidth = WinGetClientSize($BANEVADER, "")
	$CWidth = $CWidth[0]
	$StatusBar_PartsWidth[0] = $CWidth - 165
	$StatusBar_PartsWidth[1] = 99999
	$StatusBar_PartsWidth[2] = -1
	_GUICtrlStatusBar_SetParts($hStatusBar, $StatusBar_PartsWidth)
	_GUICtrlStatusBar_Resize($hStatusBar)
	Switch GUICtrlRead($Tab1)
		Case 0;tab where control exists
			_WinAPI_SetWindowPos($Console, 0, 16, 88, $CWidth - 43, $iHeight - 128, $SWP_SHOWWINDOW)
		Case Else;add just in case
			_WinAPI_SetWindowPos($Console, 0, 16, 88, $CWidth - 43, $iHeight - 128, $SWP_HIDEWINDOW)
	EndSwitch
	GUICtrlSetPos($SearchBar, 4, 35, $CWidth - $SearchBarOffset, 21)
	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_SIZE

Func WM_DROPFILES($hWnd, $MsgID, $WPARAM, $LPARAM)
	#forceref $hwnd, $MsgID, $LPARAM
	If $IsInOperation Then Return _ConsoleWrite("!>Ignoring dropped files, system busy!" & @CR, 15)
	If (GUICtrlRead($Tab1) <> 0) Then Return _ConsoleWrite("->Ignoring dropped files due to incorrect tab!" & @CR, 15)
	Local $nSize, $pFileName
	Local $nAmt = DllCall("shell32.dll", "int", "DragQueryFile", "hwnd", $WPARAM, "int", 0xFFFFFFFF, "ptr", 0, "int", 255)
	ReDim $aFilename[$nAmt[0]]
	For $I = 0 To $nAmt[0] - 1
		$nSize = DllCall("shell32.dll", "int", "DragQueryFile", "hwnd", $WPARAM, "int", $I, "ptr", 0, "int", 0)
		$nSize = $nSize[0] + 1
		$pFileName = DllStructCreate("char[" & $nSize & "]")
		DllCall("shell32.dll", "int", "DragQueryFile", "hwnd", $WPARAM, "int", $I, "ptr", DllStructGetPtr($pFileName), "int", $nSize)
		$aFilename[$I] = DllStructGetData($pFileName, 1)
		$pFileName = 0
	Next
	AdlibRegister("CheckDroppedFiles", 250)
	Return $GUI_RUNDEFMSG
EndFunc   ;==>WM_DROPFILES

#endregion - WM_MESSAGES -

#region - SQLite -

Func _BuildISPBanList()
	Local $Rows, $Columns
	Local $aTemp[1]
	Local $SQL_ERR = _SQLite_GetTable2d($hHistoryDataBase, "SELECT * FROM banned_isp;", $aBANNED_ISPs, $Rows, $Columns)
	If $SQL_ERR = $SQLite_OK Then
		Local $iTemp = UBound($aBANNED_ISPs)
		ReDim $aTemp[$iTemp]
		For $i = 0 To $iTemp - 1
			$aTemp[$i] = $aBANNED_ISPs[$i][1]
		Next
		$aBANNED_ISPs = $aTemp
	EndIf
EndFunc

Func _BuildCountryBanList()
	Local $Rows, $Columns
	Local $aTemp[1]
	Local $SQL_ERR = _SQLite_GetTable2d($hHistoryDataBase, "SELECT * FROM banned_country;", $aBANNED_Countrys, $Rows, $Columns)
	If $SQL_ERR = $SQLite_OK Then
		Local $iTemp = UBound($aBANNED_Countrys)
		ReDim $aTemp[$iTemp]
		For $i = 0 To $iTemp - 1
			$aTemp[$i] = $aBANNED_Countrys[$i][1]
		Next
		$aBANNED_Countrys = $aTemp
	EndIf
EndFunc

Func DeleteProxyByCountry()
	If (UBound($aItemSelected) < 3) Then Return
	If $aItemSelected[0] = -1 Then Return
	If $aItemSelected[1] Then Return
	If Not $aItemSelected[0] And Not _GUICtrlListView_GetItemSelected($ListView32, 0) Then Return 0
	Local $MainCountry = _GUICtrlListView_GetItemText($ListView32, $aItemSelected[0], 2)
	If Not $MainCountry Then Return 0

	Local $ItemCount = _GUICtrlListView_GetItemCount($ListView32)
	Local $Country, $IP
	For $I = 0 To $ItemCount
		$Country = _GUICtrlListView_GetItemText($ListView32, $I, 2)
		If $MainCountry == $Country Then
			$IP = _GUICtrlListView_GetItemText($ListView32, $I, 0)

			Local $Split = StringSplit($IP, ":")
			If @error Then Return
			Local $Proxy = $Split[1], $Port = $Split[2]

			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxy & "';")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")
			_GUICtrlListView_DeleteItem($hListView32, $I)
			$I -= 1; Drop a loop, catch items dropped
		EndIf
	Next
	_GUICtrlStatusBar_SetText($hStatusBar, "Deleted all proxies from: " & $MainCountry, 0)
	_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & _GUICtrlListView_GetItemCount($ListView32), 1)
	Return 1
EndFunc   ;==>DeleteProxyByCountry

Func BlacklistProxyCountry(); same as DeleteProxyByCountry() but will also blacklist and help prevent these proxies from showing up if user chooses to do so..
	If (UBound($aItemSelected) < 3) Then Return
	If $aItemSelected[0] = -1 Then Return
	If $aItemSelected[1] Then Return
	If Not $aItemSelected[0] And Not _GUICtrlListView_GetItemSelected($ListView32, 0) Then Return 0
	Local $MainCountry = _GUICtrlListView_GetItemText($ListView32, $aItemSelected[0], 2)
	If Not $MainCountry Then Return 0
	_SQLite_Exec($hHistoryDataBase, "INSERT INTO banned_country (country) VALUES ('" & $MainCountry & "');"); fucking BAN dat bitch listview ( '. __.)

	_BuildCountryBanList(); rebuild list

	Local $ItemCount = _GUICtrlListView_GetItemCount($ListView32)
	Local $Country, $IP
	For $I = 0 To $ItemCount
		$Country = _GUICtrlListView_GetItemText($ListView32, $I, 2)
		If $MainCountry == $Country Then
			$IP = _GUICtrlListView_GetItemText($ListView32, $I, 0)
			Local $Split = StringSplit($IP, ":")
			If @error Then Return
			Local $Proxy = $Split[1], $Port = $Split[2]

			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxy & "';")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")
			_GUICtrlListView_DeleteItem($hListView32, $I)
			$I -= 1; Drop a loop, catch items dropped
		EndIf
	Next
	_GUICtrlStatusBar_SetText($hStatusBar, "Deleted & blacklisted all proxies from: " & $MainCountry, 0)
	_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & _GUICtrlListView_GetItemCount($ListView32), 1)
	Return 1
EndFunc

Func BlacklistProxyISP()
	If (UBound($aItemSelected) < 3) Then Return
	If $aItemSelected[0] = -1 Then Return
	If $aItemSelected[1] Then Return
	If Not $aItemSelected[0] And Not _GUICtrlListView_GetItemSelected($ListView32, 0) Then Return 0
	Local $IP = _GUICtrlListView_GetItemText($ListView32, $aItemSelected[0])
	If Not $IP Then Return 0

	Local $Proxy = $IP, $Port
	Local $_Temp2, $_Temp

	$IP = StringSplit($IP, ":")
	If @error Then Return
	$IP = $IP[1]

	Local $InitialISP = ProxyGetISP($IP)
	If @error Then
		_GUICtrlStatusBar_SetText($hStatusBar, "Could not obtain ISP...", 0)
		Sleep(2500)
		Return
	EndIf

	_SQLite_Exec($hHistoryDataBase, "INSERT INTO banned_isp (isp) VALUES (" & _SQLite_Escape($InitialISP) & ");")

	_BuildISPBanList(); rebuild list

	Local $ItemCount = _GUICtrlListView_GetItemCount($ListView32)
	Local $_IP, $aIP, $ISP
	For $I = 0 To $ItemCount
		$_IP = _GUICtrlListView_GetItemText($ListView32, $I, 0)
		$aIP = StringSplit($_IP, ":")
		If @error Then ContinueLoop
		$ISP =  ProxyGetISP($aIP[1])
		If @error Then ContinueLoop

		$Proxy = $aIP[1]
		$Port = $aIP[2]

		$_Temp2 = Int(100 * $I / $ItemCount)
		If $_Temp <> $_Temp2 Then
			_GUICtrlStatusBar_SetText($hStatusBar, "Status: " & $_Temp2 & "%", 0)
			_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & _GUICtrlListView_GetItemCount($ListView32), 1)
		EndIf
		$_Temp = $_Temp2

		If IsISPBanned($ISP) Then


			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxy & "';")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")
			_GUICtrlListView_DeleteItem($hListView32, $I)
			$I -= 1; Drop a loop, catch items dropped
		EndIf
	Next
	_GUICtrlStatusBar_SetText($hStatusBar, "Blacklisted all proxies on ISP: " & $InitialISP, 0)
	_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & _GUICtrlListView_GetItemCount($ListView32), 1)
	Return 1
EndFunc   ;==>BlacklistProxyISP

; #FUNCTION# ====================================================================================================================
; Name ..........: RestoreSelection
; Description ...: Restores saved tested proxies to the list view control
; Syntax ........: RestoreSelection()
; Parameters ....:
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; Remarks .......:
; Related .......: SessionSave()
; ===============================================================================================================================
Func RestoreSelection()
	Local $Proxies, $Rows, $Columns

	GUICtrlSetData($ProgressLabel, "Loading proxies...")

	If _SQLite_GetTable2d($hProxyDataBase, "SELECT * FROM listviewitems ORDER BY latancy ASC;", $Proxies, $Rows, $Columns) = $SQLite_OK Then
		GUISetState(@SW_LOCK, $BANEVADER)
		If UBound($Proxies) >= 2 Then; the function above returns the name in index 0, so we only want index 1 or more
			For $I = 1 To UBound($Proxies) - 1
				GUICtrlSetData($ProgressLabel, "Loading data for " & $I & " of " & (UBound($Proxies) - 1) & " proxies...")
				_AddItemToListView($Proxies[$I][0], $Proxies[$I][1], $Proxies[$I][2], $Proxies[$I][3], $Proxies[$I][4], $Proxies[$I][5], 1)
			Next
		EndIf
		GUISetState(@SW_UNLOCK, $BANEVADER)
	EndIf
	Return SetError(0, 0, 0)
EndFunc   ;==>RestoreSelection

Func DeleteProxy()

	If (UBound($aItemSelected) < 3) Then Return
	If $aItemSelected[0] = -1 Then Return
	If $aItemSelected[1] Then Return
	If Not $aItemSelected[0] And Not _GUICtrlListView_GetItemSelected($ListView32, 0) Then Return 0
	Local $IP = _GUICtrlListView_GetItemText($ListView32, $aItemSelected[0])
	If Not $IP Then Return 0
	Local $Split = StringSplit($IP, ":")
	If @error Then Return
	Local $Proxy = $Split[1], $Port = $Split[2]

	_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxy & "';")
	_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxy & "';")
	_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxy & "';")
	_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxy & "';")
	_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxy & "';")

	_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")
	_GUICtrlListView_DeleteItem($hListView32, $aItemSelected[0])

	For $I = 0 To _GUICtrlListView_GetItemCount($ListView32)
		If _GUICtrlListView_GetItemSelected($ListView32, $I) Then
			$IP = _GUICtrlListView_GetItemText($ListView32, $I)
			$Split = StringSplit($IP, ":")
			If @error Then Return
			$Proxy = $Split[1]
			$Port = $Split[2]

			_SQLite_Exec($hProxyDataBase, "DELETE FROM dead WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM proxies WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxy & "';")
			_SQLite_Exec($hProxyDataBase, "DELETE FROM listviewitems WHERE proxy='" & $Proxy & "';")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO blacklist (proxy, port) VALUES ('" & $proxy & "','" & $Port & "');")
			_GUICtrlListView_DeleteItem($hListView32, $I)
			$I -= 1
		EndIf
	Next

	_GUICtrlStatusBar_SetText($hStatusBar, "Proxies: " & _GUICtrlListView_GetItemCount($ListView32), 1)
	Return 1
EndFunc   ;==>DeleteProxy

; #FUNCTION# ====================================================================================================================
; Name ..........: _SqliteOperations
; Description ...: Initializes the proxy database and makes various layout checks
; Syntax ........: _SqliteOperations()
; Parameters ....: None
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; ===============================================================================================================================
Func _SqliteOperations()

	_SQLite_Close($hHistoryDataBase)
	_SQLite_Close($ProxyDataBase)
	_SQLite_Shutdown()

	_SQLite_Startup()
	If @error Then
		MsgBox(16, "SQLite Error: SQLite3.dll Can't be Loaded!", "_SQLite_LibVersion: " & _SQLite_LibVersion() & @CR & @CR & "Try installing the SQLite dll library to fix this problem! This dll should be on your system.")
		Exit -1
	Else
		_ConsoleWrite("SQLite Loaded..." & @CR)
	EndIf

	Local $Rows, $Columns, $Test

	If Not FileExists($ProxyDataBase) Then
		$hProxyDataBase = _SQLite_Open($ProxyDataBase)
		_ConsoleWrite("	Proxy database not found."  & @CR)
		_ConsoleWrite("	Creating " & $ProxyDataBase  & @CR)
	Else
		$hProxyDataBase = _SQLite_Open($ProxyDataBase, $SQLITE_OPEN_READWRITE)
		_ConsoleWrite("	Loading existing proxy database " & $ProxyDataBase & @CR)
	EndIf

	If Not $hProxyDataBase Then
		_ConsoleWrite("	!->Error wit database " & $ProxyDataBase & @CR)
		MsgBox(16, "Error!", "Could not obtain database handle!" & @CR & "The database may be corrupt, try deleting it and running the application again if it exists.")
		Exit
	Else
		_ConsoleWrite("	Successfully loaded the proxy database." & @CR)
	EndIf

	If _SQLite_GetTable($hProxyDataBase, "SELECT name FROM sqlite_master WHERE type = 'table';", $Test, $Rows, $Columns) = $SQLite_OK Then
		If $Rows < 6 Then; Or $Update Then

			_ConsoleWrite("		Updating proxy database table layout." & @CR)

			_SQLite_Exec($hProxyDataBase, "CREATE TABLE topnotch 	(proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));")
			_SQLite_Exec($hProxyDataBase, "CREATE TABLE graveyard 	(proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));")
			_SQLite_Exec($hProxyDataBase, "CREATE TABLE proxies 	(proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));")
			_SQLite_Exec($hProxyDataBase, "CREATE TABLE dead 		(proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));")

			_SQLite_Exec($hProxyDataBase, "CREATE TABLE listviewitems (proxy TEXT, port TEXT, latancy REAL, geo TEXT, banstatus TEXT, isp TEXT, bumped INTEGER, PRIMARY KEY (proxy), UNIQUE (proxy));")

			_SQLite_Exec($hProxyDataBase, "CREATE TABLE blacklist 	(proxy TEXT, PRIMARY KEY (proxy), UNIQUE (proxy));")
			_SQLite_Exec($hProxyDataBase, "CREATE TABLE settings (setting TEXT, status INTEGER, value TEXT, value2 INTEGER, PRIMARY KEY (setting), UNIQUE (setting));")

			_ConsoleWrite("		Database tables names have been updated." & @CR)

		Else
			_ConsoleWrite("		Testing completed." & @CR)
			_ConsoleWrite("		Database table names are current." & @CR)
		EndIf
	Else
		_ConsoleWrite("		There was an error in the database query." & @CR)
		_ConsoleWrite("			!->Error Msg: " & _SQLite_ErrMsg() & @CR)
		_ConsoleWrite("			-->Failed to check for correct aount of proxy database table names." & @CR)
	EndIf

	_ConsoleWrite("	Database table tests have completed." & @CR)
	_ConsoleWrite("	Testing database user settings." & @CR)

	If _SQLite_GetTable2d($hProxyDataBase, "SELECT * FROM settings;", $Test, $Rows, $Columns) = $SQLite_OK Then
		If $Rows < 21 Then
			_ConsoleWrite("		Updating user settings database layout." & @CR)
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('UseCustomUserAgent','4'," & _SQLite_Escape($UserAgentString) & ");")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('IPRegExpSetting','4'," & _SQLite_Escape($IP_ADDRESS_REGEXP) & ");")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('IPFilter','4'," & _SQLite_Escape($DefaultIPFilter) & ");")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('SaveISPBanned','4','');"); the 4 is $GUI_UNCHECKED for the checkbox states
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value, value2) VALUES ('PruneProxies','1','3','250');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ExtraInfoResults','4','');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('SkipConnectionChecks','4','0');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ProxyOverRide','1'," & _SQLite_Escape($ProxyOverRide) & ");")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('DisplayDebug','4','');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('BanBusterPassword','1','SkittyNet');")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('TimeToWait','1','7');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('MaxRetries','1','3');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('MaxTestTime','1','30');")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ResolveTimeOut','1','3000');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ConnectTimeOut','1','3000');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ResponseTimeOut','1','2500');")

			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ShowBannedISPs','4','');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('ShowBannedCountrys','4','');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('DontTestBannedCountrys','4','');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('TestBanPage','4','');")
			_SQLite_Exec($hProxyDataBase, "INSERT INTO settings (setting, status, value) VALUES ('BannedIPDatabaseUpdate','', '');"); we'll insert a timestamp, size preferable, this way if file size changes, we shall just update the list
			_ConsoleWrite("		Operation completed." & @CR)
		Else
			_ConsoleWrite("		Database user settings are current." & @CR)
		EndIf
	Else
		_ConsoleWrite("		There was an error in the database query." & @CR)
		_ConsoleWrite("			!->Error Msg: " & _SQLite_ErrMsg() & @CR)
		_ConsoleWrite("			-->Failed to check for correct aount of user settings entries in database." & @CR)
	EndIf

	_ConsoleWrite("	User database settings tests have completed." & @CR)

	_ConsoleWrite("	Testing for history database." & @CR)

	If Not FileExists($sHistoryDB) Then

		_ConsoleWrite("		Proxy database not found."  & @CR)
		_ConsoleWrite("		Creating " & $sHistoryDB  & @CR)

		$hHistoryDataBase = _SQLite_Open($sHistoryDB)
		If Not $hHistoryDataBase Then
			_ConsoleWrite("		!>Error creating " & $sHistoryDB  & @CR)
			Return
		EndIf

		If _SQLite_GetTable($hHistoryDataBase, "SELECT name FROM sqlite_master WHERE type = 'table';", $Test, $Rows, $Columns) = $SQLite_OK Then
			If $Rows < 5 Then; Or $Update Then
				_ConsoleWrite("		Updating database tables in the applications history database." & @CR)
				_SQLite_Exec($hHistoryDataBase, "CREATE TABLE history (id INTEGER,scanned TEXT, bumped INTEGER, PRIMARY KEY (id), UNIQUE (scanned));")
				_SQLite_Exec($hHistoryDataBase, "CREATE TABLE google_searched (id INTEGER,url TEXT, PRIMARY KEY (id), UNIQUE (url));")
				_SQLite_Exec($hHistoryDataBase, "CREATE TABLE banned_isp (id INTEGER, isp TEXT, PRIMARY KEY (id), UNIQUE (isp));")
				_SQLite_Exec($hHistoryDataBase, "CREATE TABLE banned_country (id INTEGER, country TEXT, PRIMARY KEY (id), UNIQUE (country));")
				_ConsoleWrite("		Operation completed." & @CR)
			Else
				_ConsoleWrite("		Database tables seem current." & @CR)
			EndIf
		Else
			_ConsoleWrite("		!->Failed to check for correct database layout! ---!>Error Msg: " & _SQLite_ErrMsg() & @CR)
		EndIf
	Else
		_ConsoleWrite("		Loading existing proxy database " & $sHistoryDB & @CR)
		$hHistoryDataBase = _SQLite_Open($sHistoryDB, $SQLITE_OPEN_READWRITE)
		If Not $hHistoryDataBase Then
			_ConsoleWrite("			!->Error Opening DataBase!" & @CR)
			Return
		EndIf
		_ConsoleWrite("	Successfully loaded the history database." & @CR)
	EndIf

	_ConsoleWrite("	Finalizing database options." & @CR)

	_SQLite_Exec($hProxyDataBase, "PRAGMA synchronous=FULL;")
	_SQLite_Exec($hProxyDataBase, "PRAGMA auto_vacuum=FULL;")
	_SQLite_Exec($hProxyDataBase, "PRAGMA cache_size=1024;")
	_SQLite_Exec($hProxyDataBase, "PRAGMA temp_store=2;")
	_SQLite_Exec($hProxyDataBase, "PRAGMA journal_mode=DELETE;");DELETE

	_SQLite_SetTimeout($hProxyDataBase, 300)

	_SQLite_Exec($hHistoryDataBase, "PRAGMA cache_size=1024;")
	_SQLite_Exec($hHistoryDataBase, "PRAGMA synchronous=OFF;")
	_SQLite_Exec($hHistoryDataBase, "PRAGMA temp_store=2;")
	_SQLite_Exec($hHistoryDataBase, "PRAGMA journal_mode=DELETE;")

	_ConsoleWrite("Application database checks have completed." & @CR)

	Return
EndFunc   ;==>_SqliteOperations

; #FUNCTION# ====================================================================================================================
; Name ..........: _SQLITE_LOCK
; Description ...: tries to lock the database to a process so we can safely modify it, still doesn't seem to work correctly
;                   -or as I thought it would work at least
; Parameters ....: true/false
; Return values .: true/false
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; ===============================================================================================================================
Func _SQLITE_LOCK($Lock = 0)
	Local $iReturn
	Switch $Lock
		Case 1
			For $I = 0 To 500
				$iReturn = _SQLite_Exec($hProxyDataBase, "BEGIN TRANSACTION")
				Sleep(150)
				Switch $iReturn
					Case 0
						Return SetError(0, 0, 1)
					Case Else
						;MsgBox(0,"",$SQLite_Message)
						If StringInStr($SQLite_Message, "Cannot start", 2) Then;sometimes a user can exit during a transaction, check if we're alreay in one to avoid huge loop
							Return SetError(0, 0, 1)
						EndIf
				EndSwitch
			Next
			Return
		Case 0
			For $I = 0 To 500
				$iReturn = _SQLite_Exec($hProxyDataBase, "COMMIT TRANSACTION")
				Sleep(150)
				Switch $iReturn
					Case 0
						Return SetError(0, 0, 1)
				EndSwitch
			Next
	EndSwitch
	Return SetError($iReturn, 0, 0)
EndFunc   ;==>_SQLITE_LOCK

; #FUNCTION# ====================================================================================================================
; Name ..........: SetUserSettings
; Description ...: Saves the all settings in the user interface
; Syntax ........: SetUserSettings()
; Return values .: None
; Author ........: DeputyDerp
; ===============================================================================================================================
Func SetUserSettings()
	Local $Settings, $Rows, $Columns
	Local $Status, $Temp, $Data
	If _SQLite_GetTable2d($hProxyDataBase, "SELECT * FROM settings;", $Settings, $Rows, $Columns) = $SQLite_OK Then
		For $S = 1 To $Rows
			$Data = ''
			;GUICtrlSetData($ProgressLabel, "Loading user settings... (" & $Settings[$S][0] & ")")
			Switch $Settings[$S][0]
				Case 'ShowBannedISPs'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then; $GUI_CHECKED
							GUICtrlSetState($ShowBannedISPProxies, $Settings[$S][1])
						EndIf
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & GUICtrlRead($ShowBannedISPProxies) & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf
				Case 'ShowBannedCountrys'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($ShowBannedCountries, $Settings[$S][1])
						EndIf
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & GUICtrlRead($ShowBannedCountries) & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf
				Case 'DontTestBannedCountrys'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($DonttestBannedCountries, $Settings[$S][1])
						EndIf
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & GUICtrlRead($DonttestBannedCountries) & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf
				Case 'TestBanPage'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($TestBannedPage, $Settings[$S][1])
						EndIf
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & GUICtrlRead($TestBannedPage) & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf
				Case 'IPFilter'
					If $Initilize Then
						$aIP_Filter = StringSplit($Settings[$S][2], ",")
						GUICtrlSetData($IP_Filter, $Settings[$S][2])
					Else
						$Temp = StringStripWS(GUICtrlRead($IP_Filter), $STR_STRIPALL)
						$aIP_Filter = StringSplit($Temp, ",")
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape($Temp) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf
				Case 'UseCustomUserAgent'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							$UserAgentString = $Settings[$S][2]
							GUICtrlSetState($UseCustomUserAgent, $Settings[$S][1])
						Else
							GUICtrlSetState($CustomUserAgent, $GUI_DISABLE)
						EndIf
						GUICtrlSetData($CustomUserAgent, $Settings[$S][2])
					Else
						$Status = GUICtrlRead($UseCustomUserAgent)
						If $Status = 1 Then
							$UserAgentString = GUICtrlRead($CustomUserAgent)
							$Data = ", value=" & _SQLite_Escape($UserAgentString)
							If StringLen($UserAgentString) < 7 Then
								GUICtrlSetData($CustomUserAgent, $UserAgentString_backup)
								$Data = ", value=" & _SQLite_Escape($UserAgentString_backup)
							EndIf
						Else
							$Temp = GUICtrlRead($CustomUserAgent)
							$UserAgentString = $UserAgentString_backup
							If StringLen($Temp) < 7 Then
								GUICtrlSetData($CustomUserAgent, $UserAgentString_backup)
								$Data = ", value=" & _SQLite_Escape($UserAgentString_backup)
							EndIf
						EndIf
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & $Status & "'" & $Data & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'IPRegExpSetting'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($IPRegExpSetting, $Settings[$S][1])
						Else
							GUICtrlSetState($IPRegExp, $GUI_DISABLE)
						EndIf
						GUICtrlSetData($IPRegExp, $Settings[$S][2])
					Else
						$Status = GUICtrlRead($IPRegExpSetting)
						If $Status = 1 Then
							$IP_ADDRESS_REGEXP = GUICtrlRead($IPRegExp)
							$Data = ", value=" & _SQLite_Escape($IP_ADDRESS_REGEXP)
							If StringLen($IP_ADDRESS_REGEXP) < 7 Then
								GUICtrlSetData($IPRegExp, $IP_ADDRESS_REGEXP_BACKUP)
								$Data = ", value=" & _SQLite_Escape($IP_ADDRESS_REGEXP_BACKUP)
							EndIf
						Else
							$Temp = GUICtrlRead($IPRegExp)
							$IP_ADDRESS_REGEXP = $IP_ADDRESS_REGEXP_BACKUP
							If StringLen($Temp) < 7 Then
								GUICtrlSetData($IPRegExp, $IP_ADDRESS_REGEXP_BACKUP)
								$Data = ", value=" & _SQLite_Escape($IP_ADDRESS_REGEXP_BACKUP)
							EndIf
						EndIf
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & $Status & "'" & $Data & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'ResolveTimeOut'
					If $Initilize Then
						GUICtrlSetData($ResolveTimeOut, $Settings[$S][2])
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape(GUICtrlRead($ResolveTimeOut)) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'ConnectTimeOut'
					If $Initilize Then
						GUICtrlSetData($ConnectTimeOut, $Settings[$S][2])
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape(GUICtrlRead($ConnectTimeOut)) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'ResponseTimeOut'
					If $Initilize Then
						GUICtrlSetData($ResponseTimeOut, $Settings[$S][2])
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape(GUICtrlRead($ResponseTimeOut)) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'TimeToWait'
					If $Initilize Then
						GUICtrlSetData($TimeToWait, $Settings[$S][2])
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape(GUICtrlRead($TimeToWait)) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'MaxRetries'
					If $Initilize Then
						GUICtrlSetData($MaxRetries, $Settings[$S][2])
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape(GUICtrlRead($MaxRetries)) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'MaxTestTime'
					If $Initilize Then
						GUICtrlSetData($MaxTestTime, $Settings[$S][2])
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape(GUICtrlRead($MaxTestTime)) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'SaveISPBanned'; this is depreciated, now used for saving banned ISPs
					If $Initilize Then
						$ListISPBans = 0
						If $Settings[$S][1] = 1 Then
							$ListISPBans = 1
							GUICtrlSetState($SaveBannedISPproxies, $Settings[$S][1])
						EndIf
					Else
						$Status = GUICtrlRead($SaveBannedISPproxies)
						If $Status = 1 Then
							$ListISPBans = 1
						Else
							$ListISPBans = 0
						EndIf
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & $Status & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'ExtraInfoResults'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($ShowBanned, $Settings[$S][1])
						EndIf
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & GUICtrlRead($ShowBanned) & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'PruneProxies'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($PruneProxies, $Settings[$S][1])
							$PruneEvery = ($1_DAY * $Settings[$S][2])
						Else
							GUICtrlSetState($PruneDays, $GUI_DISABLE)
							GUICtrlSetState($USER_MAX_LIMIT, $GUI_DISABLE)
						EndIf
						GUICtrlSetData($PruneDays, $Settings[$S][2])
						GUICtrlSetData($USER_MAX_LIMIT, $Settings[$S][3])
						$MAX_GOODLIST = $Settings[$S][3]
					Else
						$Status = GUICtrlRead($PruneProxies)
						If $Status = 1 Then
							$PruneEvery = ($1_DAY * GUICtrlRead($PruneDays))
							$MAX_GOODLIST = GUICtrlRead($USER_MAX_LIMIT)
							$Data = ", value='" & GUICtrlRead($PruneDays) & "', value2='" & $MAX_GOODLIST & "'"
						Else
							$PruneEvery = 0
						EndIf

						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & $Status & "'" & $Data & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'ProxyOverRide'
					If $Initilize Then
						$ProxyOverRide = $Settings[$S][2]
						GUICtrlSetData($ProxyBlackList, $ProxyOverRide)
					Else
						$ProxyOverRide = StringStripWS(StringReplace(StringStripCR(GUICtrlRead($ProxyBlackList)), @LF, ""), 3)
						If $ProxyOverRide Then _SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape($ProxyOverRide) & " WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'SkipConnectionChecks'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							GUICtrlSetState($SkipConnectionChecks, $Settings[$S][1])
						EndIf
					Else
						_SQLite_Exec($hProxyDataBase, "UPDATE settings SET status='" & GUICtrlRead($SkipConnectionChecks) & "' WHERE setting='" & $Settings[$S][0] & "';")
					EndIf

				Case 'BanBusterPassword'
					If $Initilize Then
						If $Settings[$S][1] = 1 Then
							$BanBusterPassword = $Settings[$S][2]
						EndIf
					EndIf

			EndSwitch
		Next
		If $Initilize Then
			_ConsoleWrite("Settings have been loaded." & @CR)
		Else
			_ConsoleWrite("Settings have been saved." & @CR)
			_GUICtrlStatusBar_SetText($hStatusBar, "Settings have been saved!", 0)
		EndIf
	Else
		_ConsoleWrite("	!->There was an error with the database user settings." & @CR)
		_GUICtrlStatusBar_SetText($hStatusBar, "Error saving settings ;_;", 0)
	EndIf
	$Initilize = 0
	Return
EndFunc   ;==>SetUserSettings

Func _UpdateBannedProxies()

	GUICtrlSetData($ProgressLabel, "Updating blacklisted proxies... ")

	Local $Temp = FileRead($IP_BANNEDDB)
	If Not $Temp Then Return

	$Temp = StringRegExp($Temp, "(?:\d{1,3}\.){3}\d{1,3}", 3)
	If @error Then Return

	Local $Num = UBound($Temp) - 1
	Local $Tracker, $Tracker2, $SQL_ERR

	_SQLITE_LOCK(1); speed up the inserts..

	For $I = 0 To $Num
		;ConsoleWrite($Temp[$I] & @CR)
		$Tracker = Int(100 * $I / $Num)
		If $Tracker <> $Tracker2 Then
			GUICtrlSetData($ProgressLabel, "Updating blacklisted proxies... " & $Tracker & "%")
		EndIf
		$Tracker2 = $Tracker

		$SQL_ERR = _SQLite_Exec($hProxyDataBase, "INSERT OR IGNORE INTO blacklist (proxy) VALUES ('" & $Temp[$I] & "');")
		If $SQL_ERR = $SQLITE_OK Then
			;nothing
		Else
			ConsoleWrite('!>SQLite Error: ' & $SQL_ERR & " Message: " & $aSQLITE_MESSAGES[$SQL_ERR] & @CR)
		EndIf

	Next

	_SQLITE_LOCK(0)

	$Temp = 0

	Return

EndFunc

#endregion - SQLite -

#region - INTERNAL FUNCTIONS -

Func _Initialize()

	GUICtrlSetData($ProgressLabel, "/B/anBuster initializing...")

	Warnings()

	;Look for and open DLL
	Local $__hBanBusterDLL = DllOpen('.\BanBuster dll\Release\AutoIt_Helper.dll')
	If $__hBanBusterDLL = -1 Then
		$__hBanBusterDLL = DllOpen('AutoIt_Helper.dll')
		If $__hBanBusterDLL = -1 Then $__hBanBusterDLL = DllOpen('banbuster.dll')
	EndIf
	$hBanBusterDLL = $__hBanBusterDLL
	$__hBanBusterDLL = 0
	If $hBanBusterDLL = -1 Then
		If IsHWnd($IntroScreen) Then GUIDelete($IntroScreen)
		MsgBox(16, "Error!", "The proxy testing library (dll) is missing!")
		Exit
	EndIf

	GUICtrlSetData($ProgressLabel, "Loading GeoIPASNum2 database...")

    Local $sRead = FileRead($IP_ISPDATABASE)
    $ISP_Array = StringRegExp($sRead, '([\d.]{7,15}),([\d.]{7,15}),"([0-9a-zA-Z ]+)"\n', 3)
    If @error Then
		$ISP_Array = 0
		$EnableISPCheck = False
	Else
		$EnableISPCheck = True
	EndIf

    If FileExists($IP_BANNEDDB) Then
		$EnableBannedDB = True
	Else
		$EnableBannedDB = False
	EndIf

	GUICtrlSetData($ProgressLabel, "Loading IpToCountry database...")

	If FileExists($IP2GEODB) Then
		$IP2GEO_ENABLED = True; tell banbuster to enable this feature
		$IP2GEO_DATA = FileRead($IP2GEODB); keep the data in memory for quick access..
	EndIf


	$sRead = 0

	GUICtrlSetData($ProgressLabel, "Preparing /B/anBuster SQLite databases...")
	_SqliteOperations()

	GUICtrlSetData($ProgressLabel, "Finalizing GeoIPASNum2 database......")
	_BuildISPBanList()

	GUICtrlSetData($ProgressLabel, "Finalizing IpToCountry database...")
	_BuildCountryBanList()

	Local $hQuery, $Temp

	If $EnableBannedDB Then
		_SQLite_Query($hProxyDataBase, "SELECT value FROM settings WHERE setting='BannedIPDatabaseUpdate';", $hQuery) ; the query
		If _SQLite_FetchData($hQuery, $Temp, False, True) = $SQLITE_OK Then
			_SQLite_QueryFinalize($hQuery)
			$Temp = $Temp[0]
			If Int($Temp) <> FileGetSize($IP_BANNEDDB) Then
				_SQLite_Exec($hProxyDataBase, "UPDATE settings SET value='"&FileGetSize($IP_BANNEDDB)&"' WHERE setting='BannedIPDatabaseUpdate';")

				_UpdateBannedProxies()

			EndIf
		EndIf

	EndIf


	$Temp = 0

	GUICtrlSetData($ProgressLabel, "Loading user content.")
	SetUserSettings(); set variables to correct user defined values

	RestoreSelection()

;~ 	Local $ReadReturn = _WinHTTP_Action( _
;~ 				"http://pastebin.com/raw.php?i=B92D5bRR", _
;~ 				"GET", _
;~ 				Default, _
;~ 				"(compatable; BB Auth)", _
;~ 				Default _
;~ 				)
;~ 	If @error Then Exit MsgBox(16, "Error ;~;", "/B/anBuster cannot start because the authentification system is down!")

;~ 	Local $Auth
;~ 	Local $Key
;~ 	Local $LoginSuccess
;~ 	Local $Message = "/B/anBuster Auth"
;~ 	Local $Message2 = "/B/anBuster is requesting an auth key."

	If IsHWnd($IntroScreen) Then
		GUICtrlSetData($ProgressLabel, "Data finalized.")
		Sleep(1500)
		GUIDelete($IntroScreen)
	EndIf

;~ 	$Key = _Crypt_HashData($BanBusterPassword, $CALG_MD5)
;~ 	$LoginSuccess = ($ReadReturn[0] == $Key)

;~ 	If Not $LoginSuccess Then
;~ 		For $I = 0 To 2
;~ 			$Auth = InputBox($Message, $Message2)
;~ 			If @error Then Exit
;~ 			$Key = _Crypt_HashData($Auth, $CALG_MD5)
;~ 			$LoginSuccess = ($ReadReturn[0] == $Key)
;~ 			If Not $LoginSuccess Then
;~ 				$Message = "/B/anBuster Auth - Failed ;~;"
;~ 				$Message2 = "/B/anBuster is requesting an auth key." & @CRLF & @CRLF & "Attempt " & ($I+2)
;~ 				ContinueLoop
;~ 			Else
;~ 				ExitLoop
;~ 			EndIf
;~ 			Exit
;~ 		Next
;~ 	EndIf

;~ 	If Not $LoginSuccess Then
;~ 		MsgBox(16, "/B/anBuster Auth Failure!", "Authentification key was incorrect ;~;")
;~ 		Exit
;~ 	Else
;~ 		If $Auth Then _SQLite_Exec($hProxyDataBase, "UPDATE settings SET value=" & _SQLite_Escape($Auth) & " WHERE setting='BanBusterPassword';")
;~ 	EndIf

	GUISetState(@SW_SHOW, $BANEVADER);needs to be after the SQLite initialization

	Keywords(); load history from database
	SetListStyle($hlist_ui, $hList); make the history list look legit

	_GUICtrlStatusBar_SetText($hStatusBar, "Status: Ready", 0)
	_GUICtrlStatusBar_SetText($hStatusBar, "New: " & $Found & " Old: " & $AlreadyExistsCount, 1)

	$Temp = WinGetClientSize($BANEVADER, "")
	GUICtrlSetPos($SearchBar, 4, 35, $Temp[0] - $SearchBarOffset, 21)
	_WinAPI_SetWindowPos($Console, 0, 16, 88, $Temp[0] - 43, $Temp[1] - 128, $SWP_SHOWWINDOW); set the console window position correctly

	_GUICtrlRichEdit_AppendText($Console, "{\rtf1\ansi\ansicpg1252\deff0{\fonttbl{\f0\fmodern\fprq1\fcharset0 Consolas;}{\f1\fswiss\fcharset0 Arial;}}{\colortbl ;\red0\green255\blue0;\red255\green255\blue0;}{\*\generator Msftedit 5.41.15.1515;}\viewkind4\uc1\pard\qc\cf1\lang1033\b\f0\fs44 /B/reads /B/anBuster \par By ScriptKitty\fs36\par\fs20\par\i\fs24 Press [\cf2 F1\cf1 ] for help\cf0\b0\i0\f1\fs20\par}")

	RegisterMessages(1); register windows message callback function

	Return 1
EndFunc   ;==>_Initialize

Func _SQLite_ExecFast($hDB, $sSQL); This is a speedier version of sqlite exec for this particular area
	Local $aResult = DllCall($hKERNEL32, "int", "WideCharToMultiByte", "uint", 65001, "dword", 0, "wstr", $sSQL, "int", -1, _
			"ptr", 0, "int", 0, "ptr", 0, "ptr", 0)
	If @error Then Return SetError(1, @error, "") ; Dllcall error
	Local $tText = DllStructCreate("char[" & $aResult[0] & "]")
	DllCall($hKERNEL32, "int", "WideCharToMultiByte", "uint", 65001, "dword", 0, "wstr", $sSQL, "int", -1, _
			"struct*", $tText, "int", $aResult[0], "ptr", 0, "ptr", 0)
	If @error Then Return SetError(4, @error, 0)
	Local $avRval = DllCall($g_hDll_SQLite, "int:cdecl", "sqlite3_exec", _
			"ptr", $hDB, _ ; An open database
			"struct*", $tText, _ ; SQL to be executed
			"ptr", 0, _ ; Callback function
			"ptr", 0, _ ; 1st argument to callback function
			"long*", 0) ; Error msg written here
	If @error Then Return SetError(1, @error, $SQLITE_MISUSE) ; Dllcall error
	DllCall($g_hDll_SQLite, "none:cdecl", "sqlite3_free", "ptr", $avRval[5])
EndFunc   ;==>_SQLite_ExecFast

Func ShowData($Data)
	Local $UI = GUICreate("", 700, 400);to debug the response..
	GUICtrlCreateEdit($Data, 0, 0, 699, 399)
	GUISetState()
	While GUIGetMsg($UI) <> -3
	WEnd
	GUIDelete($UI)
EndFunc   ;==>ShowData

Func _ErrorLog($ScriptErrorMessage, $WebError)
	If Not $DebugInfo Then Return
	FileWriteLine(@ScriptDir & "\BanBuster-ErrorLog.log", _
			@MON & "/" & @MDAY & "/" & @YEAR & " (" & @HOUR & ":" & @MIN & ":" & @SEC & ") - " & $ScriptErrorMessage & " - [" & StringStripCR(StringReplace($WebError, @LF, "")) & "]" & @CRLF _
			)
	Return
EndFunc   ;==>_ErrorLog

Func _GetExitCodeThread($hThread)
	Local $aCall = DllCall($hKERNEL32, 'BOOL', 'GetExitCodeThread', _
			'HANDLE', $hThread, 'DWORD*', 0)
	If @error Or Not $aCall[0] Then Return SetError(1, 0, 0)
	Return $aCall[2]
EndFunc   ;==>_GetExitCodeThread

Func MutexCheck($sOccurenceName)
	Local Const $ERROR_ALREADY_EXISTS = 183
	DllCall("kernel32.dll", "handle", "CreateMutexW", "struct*", 0, "bool", 1, "wstr", $sOccurenceName); _Singlton() - I took it apart for what I needed only
	If @error Then Return SetError(@error, @extended, 0)
	Local $lastError = DllCall("kernel32.dll", "dword", "GetLastError")
	If @error Then Return SetError(@error, @extended, 0)
	If $lastError[0] = $ERROR_ALREADY_EXISTS Then
		Switch MsgBox(48 + 4 + 256 + 262144, "Warning!", "/B/anBuster's already running, launching another instance may cause errors with the database!" & @CR & @CR & "Continue anyway?")
			Case 6
				Return
			Case 7
				Exit
		EndSwitch
	Else; return because we are the initial instance
		Return SetError(0, 0, 1)
	EndIf
EndFunc   ;==>MutexCheck

; #FUNCTION# ====================================================================================================================
; Name ..........: _StringRandom
; Description ...: Generates a random alpha or numetric string
; Syntax ........: _StringRandom($Len, $AlphaNum)
; Parameters ....: $Len                 - Length of requested random string.
;                  $AlphaNum            - 0 returns a purly alpha string.
;                                       - 1 returns a alpha numetric string.
; Return values .: a random string
; Author ........: DeputyDerp aka ScriptKitty
; ===============================================================================================================================
Func _StringRandom($Len, $AlphaNum)
	Local $Boundary
	Switch $AlphaNum
		Case 0
			For $I = 1 To $Len
				Switch Random(1, 2, 1)
					Case 1
						$Boundary &= Chr(Random(65, 90, 1))
					Case 2
						$Boundary &= Chr(Random(97, 122, 1))
				EndSwitch
			Next
		Case 1
			For $I = 1 To $Len
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

Func _Proxy_Get_Country($Proxy)
	Local $sIP = $Proxy
	$Proxy = ''
	Local $sString = _IPv4ToInt($sIP)
	;Local $hTimer = TimerInit()
	Local $aArray = StringRegExp($IP2GEO_DATA, '"(' & StringLeft($sString, 2) & '\d{6,8})","(\d{8,10})","([a-z]+)","(\d{8,10})","([A-Z]{2})","([A-Z]{2,3})","([a-zA-Z ]+)"\n', 3)
	If @error = 0 Then
		Local $aReturn[7]
		For $i = 0 To UBound($aArray) - 1 Step 7
			If $sString >= $aArray[$i] And $sString <= $aArray[$i + 1] Then
				;$aReturn[0] = $aArray[$i]
				;$aReturn[1] = $aArray[$i + 1]
				;$aReturn[2] = $aArray[$i + 2]
				;$aReturn[3] = $aArray[$i + 3]
				;$aReturn[4] = $aArray[$i + 4]
				;$aReturn[5] = $aArray[$i + 5]
				$aReturn[6] = $aArray[$i + 6]
				ExitLoop
			EndIf
		Next
		;ConsoleWrite(">Completed: " & TimerDiff($hTimer) & @CRLF)
		$Proxy = $aReturn[6]
		If Not $Proxy Then $Proxy = "N/A"
	Else
		$Proxy = 'N/A'
		;MsgBox($MB_SYSTEMMODAL, '', 'Well an error occurred. Sorry.')
	EndIf
	Return $Proxy
EndFunc

Func _IPv4ToInt($sString) ; By JohnOne
    Local $aStringSplit = StringSplit($sString, '.', 3)
    Local $iOct1 = Int($aStringSplit[0]) * (256 ^ 3)
    Local $iOct2 = Int($aStringSplit[1]) * (256 ^ 2)
    Local $iOct3 = Int($aStringSplit[2]) * (256)
    Local $iOct4 = Int($aStringSplit[3])
    Return $iOct1 + $iOct2 + $iOct3 + $iOct4
EndFunc   ;==>_IPv4ToInt

Func _ResourceGetAsRaw($sModule, $iResType, $iResName, $iResLang = 0, $iMode = 0, $iSize = 0);This documentationless code was done by Trancexx aka the highly inteligent human alien hybrid, my favorit AutoIt dev :3

	Local $iLoaded
	Local $a_hCall = DllCall($hKERNEL32, "hwnd", "GetModuleHandleW", "wstr", $sModule)

	If @error Then
		Return SetError(1, 0, "")
	EndIf

	If Not $a_hCall[0] Then
		$a_hCall = DllCall($hKERNEL32, "hwnd", "LoadLibraryExW", "wstr", $sModule, "hwnd", 0, "int", 34)
		If @error Or Not $a_hCall[0] Then
			Return SetError(2, 0, "")
		EndIf
		$iLoaded = 1
	EndIf

	Local $hModule = $a_hCall[0]

	Switch IsNumber($iResType) + 2 * IsNumber($iResName)
		Case 0
			$a_hCall = DllCall($hKERNEL32, "hwnd", "FindResourceExW", _
					"hwnd", $hModule, _
					"wstr", $iResType, _
					"wstr", $iResName, _
					"int", $iResLang)
		Case 1
			$a_hCall = DllCall($hKERNEL32, "hwnd", "FindResourceExW", _
					"hwnd", $hModule, _
					"int", $iResType, _
					"wstr", $iResName, _
					"int", $iResLang)
		Case 2
			$a_hCall = DllCall($hKERNEL32, "hwnd", "FindResourceExW", _
					"hwnd", $hModule, _
					"wstr", $iResType, _
					"int", $iResName, _
					"int", $iResLang)
		Case 3
			$a_hCall = DllCall($hKERNEL32, "hwnd", "FindResourceExW", _
					"hwnd", $hModule, _
					"int", $iResType, _
					"int", $iResName, _
					"int", $iResLang)
	EndSwitch

	Local $a_iCall

	If @error Or Not $a_hCall[0] Then
		If $iLoaded Then
			$a_iCall = DllCall($hKERNEL32, "int", "FreeLibrary", "hwnd", $hModule)
			If @error Or Not $a_iCall[0] Then
				Return SetError(7, 0, "")
			EndIf
		EndIf
		Return SetError(3, 0, "")
	EndIf

	Local $hResource = $a_hCall[0]

	$a_iCall = DllCall($hKERNEL32, "int", "SizeofResource", "hwnd", $hModule, "hwnd", $hResource)

	If @error Or Not $a_iCall[0] Then
		If $iLoaded Then
			$a_iCall = DllCall($hKERNEL32, "int", "FreeLibrary", "hwnd", $hModule)
			If @error Or Not $a_iCall[0] Then
				Return SetError(7, 0, "")
			EndIf
		EndIf
		Return SetError(4, 0, "")
	EndIf

	Local $iSizeOfResource = $a_iCall[0]

	$a_hCall = DllCall($hKERNEL32, "hwnd", "LoadResource", "hwnd", $hModule, "hwnd", $hResource)

	If @error Or Not $a_hCall[0] Then
		If $iLoaded Then
			$a_iCall = DllCall($hKERNEL32, "int", "FreeLibrary", "hwnd", $hModule)
			If @error Or Not $a_iCall[0] Then
				Return SetError(7, 0, "")
			EndIf
		EndIf
		Return SetError(5, 0, "")
	EndIf

	Local $a_pCall = DllCall($hKERNEL32, "ptr", "LockResource", "hwnd", $a_hCall[0])

	If @error Or Not $a_pCall[0] Then
		If $iLoaded Then
			$a_iCall = DllCall($hKERNEL32, "int", "FreeLibrary", "hwnd", $hModule)
			If @error Or Not $a_iCall[0] Then
				Return SetError(7, 0, "")
			EndIf
		EndIf
		Return SetError(6, 0, "")
	EndIf

	Local $tOut
	Switch $iMode
		Case 0
			$tOut = DllStructCreate("char[" & $iSizeOfResource + 1 & "]", $a_pCall[0])
		Case 1
			$tOut = DllStructCreate("byte[" & $iSizeOfResource & "]", $a_pCall[0])
	EndSwitch

	Local $sReturnData = DllStructGetData($tOut, 1)

	If $iLoaded Then
		$a_iCall = DllCall($hKERNEL32, "int", "FreeLibrary", "hwnd", $hModule)
		If @error Or Not $a_iCall[0] Then
			Return SetError(7, 0, "")
		EndIf
	EndIf

	Switch $iSize
		Case 0
			Return SetError(0, 0, $sReturnData)
		Case Else
			Switch $iMode
				Case 0
					Return SetError(0, 0, StringLeft($sReturnData, $iSize))
				Case 1
					Return SetError(0, 0, BinaryMid($sReturnData, 1, $iSize))
			EndSwitch
	EndSwitch

EndFunc   ;==>_ResourceGetAsRaw

Func _ResourcePlaySound($ResName, $Flag = 0, $DLL = -1)

	Local $hInstance

	If $DLL = -1 Then
	  $hInstance = 0
	Else
	  $hInstance = _WinAPI_LoadLibraryEx($DLL, $LOAD_LIBRARY_AS_DATAFILE)
	EndIf

   Local Const $SND_RESOURCE = 0x00040004

	Local $ret = DllCall("winmm.dll", "int", "PlaySound", "str", $ResName, "hwnd", $hInstance, "int", BitOr($SND_RESOURCE,$Flag))
	If @error Then Return SetError(1, 0, 0)

	If $DLL <> -1 Then _WinAPI_FreeLibrary($hInstance)
	If @error Then Return SetError(2, 0, 0)

	Return $ret[0]
EndFunc

; #FUNCTION# ====================================================================================================================
; Name ..........: Terminate
; Description ...: Cleans up when shutting down and maintains the database
; Syntax ........: Terminate()
; Parameters ....:
; Return values .: None
; Author ........: DeputyDerp aka ScriptKitty
; Modified ......:
; ===============================================================================================================================
Func Terminate()
	OnAutoItExitUnRegister("Terminate")
	RegisterMessages()

 	If $ServerStatus = True Then $UpnpPorts.Remove($ProxyTestPort, "TCP")

	If $StopCreditsShow = False Then _ExitCredits()
	$StopOperation = 0;set to zero to prevent errors with SQLite

	GUIDelete($hlist_ui)
	GUIDelete($reCaptcha_UI)
	GUIDelete($ProxySettingsGUI)
	GUISetState(@SW_HIDE, $BANEVADER)

	_GUICtrlRichEdit_Destroy($Console)

	_GDIPlus_Shutdown()

	_TerminateSession()

	;_SQLITE_LOCK(1);waits until a lock on database has been set for modification by this area

	_GUICtrlListView_UnRegisterSortCallBack($ListView32)

	GUIDelete($BANEVADER)

	If $Proxy_Used[0] Then _SetProxyData();remove any previously used proxy

	#region - MANAGE DATABASE -

	Local $Proxies, $Rows, $Columns, $Temp, $ProxyCount


	If $PruneEvery Then
		If _SQLite_GetTable2d($hProxyDataBase, "SELECT * FROM topnotch ORDER BY bumped ASC LIMIT " & $MAX_GOODLIST & ",100;", $Proxies, $Rows, $Columns) = $SQLite_OK Then
			$ProxyCount = UBound($Proxies) - 1
			$Temp = DllCall("msvcrt.dll", "int:cdecl", "time", "int", 0)
			For $I = 1 To $ProxyCount
				If ((Int(($Temp[0] - $Proxies[$I][6]) / $PruneEvery)) > 0) Then;delete proxies older than user specified days
					_SQLite_Exec($hProxyDataBase, "DELETE FROM topnotch WHERE proxy='" & $Proxies[$I][0] & "';")
					_SQLite_Exec($hProxyDataBase, "INSERT INTO graveyard (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $Proxies[$I][0] & "','" & $Proxies[$I][1] & "','" & $Proxies[$I][2] & "','" & $Proxies[$I][3] & "'," & _SQLite_Escape($Proxies[$I][4]) & "," & _SQLite_Escape($Proxies[$I][5]) & ",'" & $Temp[0] & "');")
				EndIf
			Next
		EndIf


		If _SQLite_GetTable2d($hProxyDataBase, "SELECT * FROM graveyard ORDER BY bumped ASC;", $Proxies, $Rows, $Columns) = $SQLite_OK Then
			$ProxyCount = UBound($Proxies) - 1
			$Temp = DllCall("msvcrt.dll", "int:cdecl", "time", "int", 0)
			For $I = 1 To $ProxyCount
				If ((Int(($Temp[0] - $Proxies[$I][6]) / ($1_DAY * 10))) > 0) Then; Delete when older than 7 days
					_SQLite_Exec($hProxyDataBase, "DELETE FROM graveyard WHERE proxy='" & $Proxies[$I][0] & "';")
					_SQLite_Exec($hProxyDataBase, "INSERT INTO dead (proxy, port, latancy, geo, banstatus, isp, bumped) VALUES ('" & $Proxies[$I][0] & "','" & $Proxies[$I][1] & "','" & $Proxies[$I][2] & "','" & $Proxies[$I][3] & "'," & _SQLite_Escape($Proxies[$I][4]) & "," & _SQLite_Escape($Proxies[$I][5]) & ");")
				EndIf
			Next
		EndIf

		If _SQLite_GetTable2d($hHistoryDataBase, "SELECT * FROM history ORDER BY bumped ASC;", $Proxies, $Rows, $Columns) = $SQLite_OK Then
			$ProxyCount = UBound($Proxies) - 1
			$Temp = DllCall("msvcrt.dll", "int:cdecl", "time", "int", 0)
			For $I = 1 To $ProxyCount
				If ((Int(($Temp[0] - $Proxies[$I][2]) / ($1_DAY * 30))) > 0) Then;delete after 30 days not used search term
					_SQLite_Exec($hHistoryDataBase, "DELETE FROM history WHERE scanned=" & _SQLite_Escape($Proxies[$I][1]) & ";")
				EndIf
			Next
		EndIf

	EndIf

	#endregion - MANAGE DATABASE -

	$StopOperation = 1

	;_SQLITE_LOCK(0);Unlock database/End transaction

	_SQLite_Close($hProxyDataBase)
	_SQLite_Close($hHistoryDataBase)
	_SQLite_Shutdown()

	If $hBanBusterDLL <> -1 Then
;~ 		For $I = 0 To UBound($aThread) - 1
;~ 			DllCall($hKERNEL32, 'BOOL', 'TerminateThread', 'HANDLE', $aThread[$I], 'DWORD*', 0)
;~ 			DllCall($hKERNEL32, 'BOOL', 'CloseHandle', 'HANDLE', $aThread[$I])
;~ 		Next
		DllClose($hBanBusterDLL); close the dll
	EndIf

	DllClose($hUSER32)
	DllClose($hKERNEL32)
	;DllClose($hNTDLL)
	DllClose($hMSVCRT)

	Exit 0
EndFunc   ;==>Terminate

Func _ErrFunc($oError)
	#forceref $oError
	$ServerStatus = False
EndFunc   ;==>_ErrFunc

Func Warnings()

	If Not _WinHttpCheckPlatform() Then
		MsgBox(48, "Error!", "WinHTTP is not available on your system!")
		Exit 1
	EndIf

	Return ;return since.. I already tested on these..

	If FileExists($ProxyDataBase) Then Return
	If @OSArch <> "X86" Then
		TrayTip("Warning!", "This application has not been tested on 64-bit operating systems!" & @CR & _
				"The application may encounter an error due to unforseen bugs in the code.", 3, 2)
		Sleep(5000)
	EndIf
	If @OSVersion <> "WIN_XP" Then
		TrayTip("Warning!", "This application has not been tested on this operating system!" & @CR & _
				"The application may encounter an error due to unforseen bugs in the code.", 3, 2)
	EndIf

EndFunc   ;==>Warnings

#endregion - INTERNAL FUNCTIONS -

; And that's all :3