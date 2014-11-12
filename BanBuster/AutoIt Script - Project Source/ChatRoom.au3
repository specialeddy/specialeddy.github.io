#include-once

#Obfuscator_Ignore_Funcs=_CHAT_WinEventProc, _CHAT_WM_MOUSEMOVE

Global $DomainAddress = "the.weaponizedpony.com"
Global $ChatPort = 81

Global $_CHAT_GUIHeight=300
Global $_CHAT_GUIWidth=400
Global $_CHAT_splitWidth=3
Global $_CHAT_leftVSplit=300
Global $_CHAT_topHSplit=175
Global $_CHAT_topMargin=6
Global $_CHAT_leftMargin=4
Global $_CHAT_rigthMargin=4
Global $_CHAT_bottomMargin=6
Global $_CHAT_statusBarHeight

Global $_CHAT_GUIMINHT = 250; Resizing / minimum hight
Global $_CHAT_GUIMINWID = 350; Resizing / minimum width

Global $_CHAT_hMouseHook = -1; We will register mouse movment dllcallback
Global $_CHAT_hMouseProc = -1; = DllCallbackRegister("WM_MOUSEMOVE", "int", "int;ptr;ptr"); this way our UI stays lightning fast...
; used to detect window focus, enabling us to disable/enable the mouse capture, which is a little CPU intemsive :P
Global $_CHAT_hWinEventProc = -1; = DllCallbackRegister("_WinEventProc", "none", "hwnd;int;hwnd;long;long;int;int")
Global $_CHAT_hWindowsHook = -1
Global $_CHAT_UI_Activated = 0; to prevent double registering windows messages just for the heck of it

Global $_CHAT_hKERNEL32
Global $_CHAT_hUSER32

Global $_CHAT_UI_Style = BitOR($WS_CAPTION, $WS_SYSMENU, $WS_THICKFRAME, $WS_MINIMIZEBOX, $WS_MAXIMIZEBOX, $WS_CLIPCHILDREN)
Global $_CHAT_UI_StyleEx = -1
Global $_CHAT_PingTime
Global $_CHAT_GUI

Global $_CHAT_M_ID_Connect = 1000, $_CHAT_M_ID_Disconnect = 1001
Global $_CHAT_hFile, $_CHAT_hMain
Global $_CHAT_ChatWindow
Global $_CHAT_UserList
Global $_CHAT_Pic2, $_CHAT_hPic2
Global $_CHAT_Pic1, $_CHAT_hPic1

Global $_CHAT_aParts[2] = [$_CHAT_leftVSplit,-1]
Global $_CHAT_aText[2] = ["Idle...", ""]
Global $_CHAT_DragCtrl
Global $_CHAT_Status1
Global $_CHAT_a_rect

Global $_CHAT_Send

Global $_CHAT_Server = -1, $_CHAT_Logs
Global $_CHAT_CurrentUsers[100][2]
Global $_CHAT_precedingMsg,$_CHAT_stopTime

Global $_CHAT_hENTER
Global $_CHAT_AccelKeys[1][2]

Global $_CHAT_Settings
Global $_CHAT_IP
Global $_CHAT_Port
Global $_CHAT_User
Global $_CHAT_Connect
Global $_CHAT_Exit

Global $_CHAT_Mutex

If $CmdLine[0] > 0 Then
	If $CmdLine[1] == "/chat" Then
		;If Not IsChatRunning($_CHAT_Mutex) Then
			_CHAT_EnableChat()
		;Else
		;	Exit
		;EndIf
	Else
		; MsgBox(64, "Information!",
		; on second thought.. theres no need to warn of invalid paramteres...
		; .__.
	EndIf
EndIf

Func IsChatRunning(ByRef $ChatMutex, $sOccurenceName = "BanBusterChat")
	Local Const $ERROR_ALREADY_EXISTS = 183
	$ChatMutex = DllCall("kernel32.dll", "handle", "CreateMutexW", "struct*", 0, "bool", 1, "wstr", $sOccurenceName); _Singlton() - I took it apart for what I needed only
	If @error Then Return SetError(@error, @extended, 0)
	Local $lastError = DllCall("kernel32.dll", "dword", "GetLastError")
	If @error Then Return SetError(@error, @extended, 0)
	If $lastError[0] = $ERROR_ALREADY_EXISTS Then
		$ChatMutex = $ChatMutex[0]
		Return 1
	Else; return because we are the initial instance
		$ChatMutex = 0
		Return 0
	EndIf
EndFunc   ;==>MutexCheck

Func _CHAT_EnableChat()

	$_CHAT_hKERNEL32 = DllOpen("kernel32.dll")
	$_CHAT_hUSER32 = DllOpen("user32.dll")

	$_CHAT_GUI  = GUICreate("SkittyNet", $_CHAT_GUIWidth, $_CHAT_GUIHeight, -1, -1, $_CHAT_UI_Style, $_CHAT_UI_StyleEx)
	GUISetOnEvent ($GUI_EVENT_CLOSE, '_CHAT_EXIT', $_CHAT_GUI)
	GUISetOnEvent ($GUI_EVENT_MAXIMIZE, '_CHAT_Resize', $_CHAT_GUI)
	GUISetOnEvent ($GUI_EVENT_RESIZED, '_CHAT_Resize', $_CHAT_GUI)
	GUISetOnEvent ($GUI_EVENT_RESTORE, '_CHAT_Resize', $_CHAT_GUI)



	$_CHAT_hFile = _GUICtrlMenu_CreateMenu()
	_GUICtrlMenu_InsertMenuItem($_CHAT_hFile, 0, "Disconnect", $_CHAT_M_ID_Disconnect)
	_GUICtrlMenu_InsertMenuItem($_CHAT_hFile, 0, "Connect", $_CHAT_M_ID_Connect)
	$_CHAT_hMain = _GUICtrlMenu_CreateMenu()
	_GUICtrlMenu_InsertMenuItem($_CHAT_hMain, 0, "&Settings", 0, $_CHAT_hFile)
	_GUICtrlMenu_SetMenu($_CHAT_GUI, $_CHAT_hMain)

	$_CHAT_ChatWindow = _GUICtrlRichEdit_Create($_CHAT_GUI, "", $_CHAT_leftMargin, $_CHAT_topMargin, $_CHAT_leftVSplit-$_CHAT_leftMargin, $_CHAT_topHSplit-$_CHAT_topMargin, BitOR($ES_MULTILINE, $WS_VSCROLL, $ES_AUTOVSCROLL, $ES_READONLY), BitOR($WS_EX_CLIENTEDGE, $WS_EX_TOPMOST))
	_GUICtrlRichEdit_SetBkColor($_CHAT_ChatWindow, 0x1F1F1F)

	$_CHAT_UserList = GUICtrlCreateListView("Users", $_CHAT_leftVSplit+$_CHAT_splitWidth, $_CHAT_topMargin, $_CHAT_GUIWidth-$_CHAT_rigthMargin-($_CHAT_leftVSplit+$_CHAT_splitWidth), $_CHAT_topHSplit-$_CHAT_topMargin, -1, $WS_EX_CLIENTEDGE)
	DllCall($_CHAT_hUSER32, "lresult", "SendMessage", "hwnd", GUICtrlGetHandle($_CHAT_UserList), "uint", 0x1000 + 30, "wparam", 0, "lparam", 90); set width of the columns in the list view
	GUICtrlSetBkColor($_CHAT_UserList, 0x1F1F1F)
	GUICtrlSetColor($_CHAT_UserList, 0xD9D9D9)

	$_CHAT_Pic2 = GUICtrlCreatePic("", $_CHAT_leftMargin, $_CHAT_topHSplit, $_CHAT_GUIWidth-$_CHAT_leftMargin-$_CHAT_rigthMargin, $_CHAT_splitWidth, $SS_NOTIFY);!!! BitOR($SS_NOTIFY, $SS_ETCHEDFRAME), $WS_EX_CLIENTEDGE)
	GUICtrlSetCursor($_CHAT_Pic2, 11)
	$_CHAT_hPic2 = ControlGetHandle($_CHAT_GUI, "", $_CHAT_Pic2)

	;vertical divider
	$_CHAT_Pic1 = GUICtrlCreateLabel("", $_CHAT_leftVSplit, $_CHAT_topMargin, $_CHAT_splitWidth, $_CHAT_topHSplit-$_CHAT_topMargin, $SS_NOTIFY)
	GUICtrlSetCursor($_CHAT_Pic1, 13)
	$_CHAT_hPic1 = ControlGetHandle($_CHAT_GUI, "", $_CHAT_Pic1)

	;statusBar
	$_CHAT_Status1 = _GuiCtrlStatusBar_Create ($_CHAT_GUI, $_CHAT_aParts, $_CHAT_aText)
	$_CHAT_a_rect = _GUICtrlStatusBar_GetRect ($_CHAT_Status1, 1)
	$_CHAT_statusBarHeight=($_CHAT_a_rect[3]-$_CHAT_a_rect[1])

	$_CHAT_Send = GUICtrlCreateEdit("", $_CHAT_leftMargin, $_CHAT_topHSplit+$_CHAT_splitWidth, $_CHAT_GUIWidth-$_CHAT_leftMargin-$_CHAT_rigthMargin, $_CHAT_GUIHeight-$_CHAT_bottomMargin-$_CHAT_statusBarHeight-$_CHAT_topHSplit-$_CHAT_splitWidth, -1)
	GUICtrlSetBkColor ($_CHAT_Send, 0x1F1F1F)
	GUICtrlSetColor ($_CHAT_Send, 0xD9D9D9)

	Opt ("MouseCoordMode", 2)
	Opt ('GUIOnEventMode', 1)

	GUISetState (@SW_SHOW)

	_CHAT_ResizeControls()

	$_CHAT_hENTER = GUICtrlCreateDummy()
	GUICtrlSetOnEvent(-1, "_CHAT_ENTER")
	$_CHAT_AccelKeys[0][0] = "{ENTER}"
	$_CHAT_AccelKeys[0][1] = $_CHAT_hENTER
	GUISetAccelerators($_CHAT_AccelKeys)


	$_CHAT_Settings = GUICreate ('Connection Settings', 180, 100, -1, -1, -1, 128)
	GUISetOnEvent  ($GUI_EVENT_CLOSE, '_CHAT_Hide')
	GUICtrlCreateGroup  ('', 5, 0, 170, 94)
	$_CHAT_IP = GUICtrlCreateInput ($DomainAddress, 12, 13, 100, 21, 1)
	$_CHAT_Port = GUICtrlCreateInput ($ChatPort, 117, 13, 50, 21, 1)
	$_CHAT_User = GUICtrlCreateInput ("", 12, 39, 156, 21, 1)

	$_CHAT_Connect = GUICtrlCreateButton ('Connect', 12, 66, 100, 20, $WS_GROUP)
	GUICtrlSetOnEvent ($_CHAT_Connect, '_CHAT_Start')
	$_CHAT_Exit = GUICtrlCreateButton ('Exit', 117, 66, 50, 20, $WS_GROUP)
	GUICtrlSetOnEvent ($_CHAT_Exit, '_CHAT_hide')


	GUIRegisterMsg($WM_SIZE,"_CHAT_RESIZE_CONTROLS")
	GUIRegisterMsg($WM_EXITSIZEMOVE, "_CHAT_WM_EXITSIZEMOVE")
	GUIRegisterMsg($WM_ENTERSIZEMOVE, "_CHAT_WM_ENTERSIZEMOVE")
	GUIRegisterMsg($WM_GETMINMAXINFO, "_CHAT_WM_GETMINMAXINFO")
	GUIRegisterMsg($WM_COMMAND, "_CHAT_WM_COMMAND")

	_CHAT_UI_SetMouseHook(1)
	_CHAT_UI_SetWindowHook(1)

	OnAutoItExitRegister("_CHAT_EXIT")

	Local $_CHAT_Recv

	While 1
		Sleep (15)
		If $_CHAT_Server <> -1 Then
			$_CHAT_Recv = TcpRecv ($_CHAT_Server, 1000000)
			If @Error And @error <> -1 Then
				MsgBox (48, 'Server Notice (' & @error & ')','You have been disconnected from the server.')
				_CHAT_Disconnect ()
			EndIf
			If $_CHAT_Recv = '<ping>' Then
				_CHAT_StatusBar_SetText($_CHAT_Status1, "Ping: " & Int(TimerDiff($_CHAT_PingTime)) & "ms", 1)
			ElseIf $_CHAT_Recv = '<USEREXISTS>' Then
				Sleep (100)
				MsgBox (48, 'Server Notice','Your username is already in use, please change it and try again.')
				_CHAT_Disconnect ()
			ElseIf $_CHAT_Recv = '<MAXCON>' Then
				Sleep (100)
				MsgBox (48, 'Server Notice','Max amount of connections reached, try again later.')
				_CHAT_Disconnect ()
			ElseIf $_CHAT_Recv = '<BANNED>' Then
				Sleep (100)
				MsgBox (48, 'Server Notice','Your IP address has been banned.')
				_CHAT_Disconnect ()
			ElseIf StringLeft ($_CHAT_Recv, 4) = '/log' Then
				;FileWriteLine ('Logged.txt', StringTrimLeft ($_CHAT_Recv, 5))
			ElseIf $_CHAT_Recv <> '' Then
				_CHAT_ParseMessage (StringReplace ($_CHAT_Recv, '%Time', @HOUR & ':' & @MIN))
			EndIf
		EndIf
	WEnd
EndFunc

#Region - Chat -

Func _CHAT_Start ()
	If GUICtrlRead ($_CHAT_User) == '' Or GUICtrlRead ($_CHAT_IP) == '' Or GUICtrlRead ($_CHAT_Port) == '' Then Return @Error
	TcpStartUp ()
	$_CHAT_Server = TcpConnect (TCPNameToIP ( GUICtrlRead ($_CHAT_IP) ), GUICtrlRead ($_CHAT_Port))
	If $_CHAT_Server = -1 Or @Error Then
		WinSetOnTop ($_CHAT_Settings, '', 0)
		Sleep (100)
		MsgBox (16, 'Fatal Error','Unable to connect to the server, change your settings and try again.')
		WinSetOnTop ($_CHAT_Settings, '', 1)
		Return @Error
	EndIf
	Sleep (150)
	TcpSend ($_CHAT_Server, "<USER>" & GUICtrlRead ($_CHAT_User) & "</USER>")
	GUISetState (@SW_HIDE, $_CHAT_Settings)
	WinSetOnTop ($_CHAT_Settings, '', 0)
	_CHAT_StatusBar_SetText($_CHAT_Status1, "Online...")
	AdlibRegister("_CHAT_ping", 3000)
EndFunc

Func _CHAT_ENTER()

	Local $_CHAT_Read = StringReplace (GUICtrlRead ($_CHAT_Send), @LF, '')
	If Not $_CHAT_Read Then Return
	If $_CHAT_Read = '/clear' Then
		_GUICtrlRichEdit_SetText($_CHAT_ChatWindow, "")
	ElseIf $_CHAT_Read = '/logs' Then
		;_Logs ()
	ElseIf $_CHAT_Read = '/save' Then
		;FileWrite (@MDAY & '-' & @MON & '-' & @YEAR & '_' & @HOUR & '-' & @MIN & '-' & @SEC & '_Logs.txt', GUICtrlRead ($_CHAT_History))
	ElseIf $_CHAT_Read = '/disconnect' Or $_CHAT_Read = '/exit' Then
		_CHAT_Disconnect ()
	Else
		TcpSend ($_CHAT_Server, _CHAT_ConvertEntities($_CHAT_Read))
	EndIf
	GUICtrlSetData ($_CHAT_Send, '')
EndFunc

Func _CHAT_ConvertEntities($_CHAT_Text, $_CHAT_do = 0)
    Local $_CHAT_aEntities[2][2]=[["&lt;","<"],["&gt;",">"]]
	Switch $_CHAT_do
		Case 0
			For $_CHAT_x = 0 to Ubound($_CHAT_aEntities)-1
				$_CHAT_Text = StringReplace($_CHAT_Text,$_CHAT_aEntities[$_CHAT_x][1],$_CHAT_aEntities[$_CHAT_x][0])
			Next
		Case 1
			For $_CHAT_x = 0 to Ubound($_CHAT_aEntities)-1
				$_CHAT_Text = StringReplace($_CHAT_Text,$_CHAT_aEntities[$_CHAT_x][0],$_CHAT_aEntities[$_CHAT_x][1])
			Next
	EndSwitch
    Return $_CHAT_Text
EndFunc


;~ Func _CHAT_Logs ()
;~ 	$_CHAT_Logs = GUICreate ('Admin Logs', 375, 203, -1, -1, -1, 128)
;~ 	GUISetOnEvent ($_CHAT_GUI_EVENT_CLOSE, '_Delete')
;~ 	$_CHAT_Edit = GUICtrlCreateEdit ('', 0, 1, 375, 203, 2103360 + $ES_MULTILINE)
;~ 	GUICtrlSetFont ($_CHAT_Edit, 10, -1, -1, 'Lucida Sans Unicode')
;~ 	GUICtrlSetBkColor ($_CHAT_Edit, 0x83B4FC)
;~ 	GUICtrlSetColor ($_CHAT_Edit, 0xFFFFFF)
;~ 	GUISetState (@SW_SHOW)
;~ 	GUICtrlSetData ($_CHAT_Edit, FileRead ('Logged.txt'))
;~ 	WinSetOnTop ($_CHAT_Logs, '', 1)
;~ EndFunc

Func _CHAT_Delete ()
	GUIDelete ($_CHAT_Logs)
EndFunc

Func _CHAT_Disconnect ()

	_CHAT_StatusBar_SetText($_CHAT_Status1, "Offline...")
	_CHAT_StatusBar_SetText($_CHAT_Status1, "", 1)

	_CHAT_ConsoleWrite("Disconnected from chat." & @CR, 9, 0xB5B5B5, "-bo")
	TcpCloseSocket ($_CHAT_Server)
	$_CHAT_Server = -1
	GUISetState (@SW_HIDE, $_CHAT_Settings)

	For $_CHAT_I = 0 To UBound($_CHAT_CurrentUsers) -1
		If $_CHAT_CurrentUsers[$_CHAT_i][0] Then
			GUICtrlDelete($_CHAT_CurrentUsers[$_CHAT_i][1])
			$_CHAT_CurrentUsers[$_CHAT_i][0] = ""
			$_CHAT_CurrentUsers[$_CHAT_i][1] = ""
		EndIf
	Next

	AdlibUnRegister("_CHAT_ping")

	TCPShutdown ()

EndFunc

Func _CHAT_Connect ()
	GUISetState (@SW_SHOW, $_CHAT_Settings)
	WinSetOnTop ($_CHAT_Settings, '', 1)
EndFunc

Func _CHAT_ping()
	TcpSend ($_CHAT_Server, "<ping>")
	$_CHAT_PingTime = TimerInit()
EndFunc

Func _CHAT_Hide ()
	;WinSetOnTop ($_CHAT_GUI, '', 0)
	GUISetState (@SW_HIDE, $_CHAT_Settings)
EndFunc

Func _CHAT_ParseMessage ($_CHAT_Data)
	ConsoleWrite($_CHAT_Data & @CR)
	Local $_CHAT_Body
	Local $_CHAT_RecievedData
	Local $_CHAT_type[5] = ["server", "pm", "chat", "roleplay", "user"]
	For $_CHAT_t = 0 To 4
		$_CHAT_Body = StringRegExp($_CHAT_Data, '(?si)<body="'&$_CHAT_type[$_CHAT_t]&'">(.*?)</body>',3)
		If Not @error Then
			Switch $_CHAT_t
				Case 0
					For $_CHAT_i = 0 to UBound($_CHAT_Body)-1
						;MsgBox(0, "", $_CHAT_Body[$_CHAT_i] & @CR)
						$_CHAT_RecievedData = StringRegExp($_CHAT_Body[$_CHAT_i], "(?s)<time>([^<]*)</time><message>([^<]*)</message>",3)
						_CHAT_ConsoleWrite(_CHAT_ConvertEntities($_CHAT_RecievedData[1],1) & @CR, 9, 0xB5B5B5, "-bo")
					Next

				Case 1
					For $_CHAT_i = 0 to UBound($_CHAT_Body)-1
						$_CHAT_RecievedData = StringRegExp($_CHAT_Body[$_CHAT_i], "(?s)<time>([^<]*)</time><user>([^<]*)</user><message>([^<]*)</message>",3)

						_CHAT_ConsoleWrite(_CHAT_ConvertEntities($_CHAT_RecievedData[1],1), 10, 0xED5DF5, "+bo")
						_CHAT_ConsoleWrite(": " & _CHAT_ConvertEntities($_CHAT_RecievedData[2],1) & @CR, 9, 0xD9D9D9, "-bo")
					Next

				Case 2
					For $_CHAT_i = 0 to UBound($_CHAT_Body)-1
						$_CHAT_RecievedData = StringRegExp($_CHAT_Body[$_CHAT_i], "(?s)<time>([^<]*)</time><user>([^<]*)</user><message>([^<]*)</message>",3)

						_CHAT_ConsoleWrite(_CHAT_ConvertEntities($_CHAT_RecievedData[1],1), 10, 0x7399C7, "+bo")
						_CHAT_ConsoleWrite(": " & _CHAT_ConvertEntities($_CHAT_RecievedData[2],1) & @CR, 9, 0xD9D9D9, "-bo")
					Next

				Case 3
					For $_CHAT_i = 0 to UBound($_CHAT_Body)-1
						$_CHAT_RecievedData = StringRegExp($_CHAT_Body[$_CHAT_i], "(?s)<time>([^<]*)</time><user>([^<]*)</user><message>([^<]*)</message>",3)

						_CHAT_ConsoleWrite(_CHAT_ConvertEntities($_CHAT_RecievedData[1],1)&" "&_CHAT_ConvertEntities($_CHAT_RecievedData[2],1) & @CR, 10, 0x7399C7, "+bo")
					Next

				Case 4
					For $_CHAT_i = 0 to UBound($_CHAT_Body)-1
						$_CHAT_RecievedData = StringRegExp($_CHAT_Body[$_CHAT_i], "(?s)<status>([^<]*)</status><user>([^<]*)</user>",3)
						If Not @error Then
							Local $_CHAT_ID
							Switch $_CHAT_RecievedData[0]
								Case 0
									For $_CHAT_x = 0 To UBound($_CHAT_CurrentUsers) -1
										If $_CHAT_CurrentUsers[$_CHAT_x][0] Then
											If $_CHAT_CurrentUsers[$_CHAT_x][0] == $_CHAT_RecievedData[1] Then
												GUICtrlDelete($_CHAT_CurrentUsers[$_CHAT_x][1])
												$_CHAT_CurrentUsers[$_CHAT_x][0] = ""
												$_CHAT_CurrentUsers[$_CHAT_x][1] = ""
											EndIf
										EndIf
									Next

								Case 1

									For $_CHAT_x = 0 To UBound($_CHAT_CurrentUsers) -1
										If Not $_CHAT_CurrentUsers[$_CHAT_x][0] Then
											$_CHAT_id = $_CHAT_x
											ExitLoop
										EndIf
									Next

									For $_CHAT_x = 0 To UBound($_CHAT_CurrentUsers) -1
										If $_CHAT_CurrentUsers[$_CHAT_x][0] = $_CHAT_RecievedData[1] Then
											ContinueLoop 2
										EndIf
									Next

									$_CHAT_CurrentUsers[$_CHAT_id][1] = GUICtrlCreateListViewItem($_CHAT_RecievedData[1], $_CHAT_UserList)
									$_CHAT_CurrentUsers[$_CHAT_id][0] = $_CHAT_RecievedData[1]

							EndSwitch
						EndIf
					Next

			EndSwitch
		EndIf
	Next
	If WinGetState($_CHAT_GUI) <> 8 Then
		_WinAPI_FlashWindowEx($_CHAT_GUI, 10)
	EndIf
	GUICtrlSetState($_CHAT_Send, $GUI_FOCUS)
EndFunc

Func _CHAT_ConsoleWrite($_CHAT_Data, $_CHAT_Size = 0, $_CHAT_Color = 0, $_CHAT_Style = 0)
	If Not $_CHAT_Data Then Return

	If $_CHAT_Size Then
		_GUICtrlRichEdit_SetFont($_CHAT_ChatWindow, $_CHAT_Size, "Arial")
	Else
		_GUICtrlRichEdit_SetFont($_CHAT_ChatWindow, 11, "Arial")
	EndIf

	If $_CHAT_Color Then Return _GUICtrlRichEdit_AppendTextColor($_CHAT_ChatWindow, $_CHAT_Data, $_CHAT_Color, $_CHAT_Style)
	Return
EndFunc   ;==>_CHAT_ConsoleWrite

Func _CHAT_GUICtrlRichEdit_AppendTextColor($_CHAT_hWnd, $_CHAT_sText, $_CHAT_iColor, $_CHAT_Style = 0)
	Local $_CHAT_iLength = _GUICtrlRichEdit_GetTextLength($_CHAT_hWnd, True, True) ; RichEdit stores text as 2 Byte Unicode chars
	Local $_CHAT_iCp = _GUICtrlRichEdit_GetCharPosOfNextWord($_CHAT_hWnd, $_CHAT_iLength)
	_GUICtrlRichEdit_AppendText($_CHAT_hWnd, $_CHAT_sText)
	_GUICtrlRichEdit_SetSel($_CHAT_hWnd, $_CHAT_iCp - 1, $_CHAT_iLength + StringLen($_CHAT_sText)) ; position in 2 Byte "Unicode"
	_GUICtrlRichEdit_SetCharColor($_CHAT_hWnd, _ColorConvert($_CHAT_iColor))
	If $_CHAT_Style Then _GUICtrlRichEdit_SetCharAttributes($_CHAT_hWnd, $_CHAT_Style, True)
	_GUICtrlRichEdit_Deselect($_CHAT_hWnd)
EndFunc   ;==>_GUICtrlRichEdit_AppendTextColor

Func _CHAT_StatusBar_SetText($_CHAT_hWnd, $_CHAT_sText = "", $_CHAT_row = 0)
	Local $_CHAT_tText = DllStructCreate("wchar Text[" & StringLen($_CHAT_sText) + 1 & "]")
	DllStructSetData($_CHAT_tText, "Text", $_CHAT_sText)
	DllCall("user32.dll", "none", "SendMessageW", "hwnd", $_CHAT_hWnd, "uint", 0x400 + 11, "wparam", $_CHAT_row, "struct*", $_CHAT_tText)
	Return
EndFunc   ;==>_StatusBar_SetText

#EndRegion - Chat -

#Region - GUI MANAGMENT -

Func _CHAT_Resize()
	_CHAT_ResizeControls()
	_CHAT_saveSplitPos()
EndFunc

Func _CHAT_WM_ENTERSIZEMOVE($_CHAT_hWnd, $_CHAT_iMsg, $_CHAT_iwParam, $_CHAT_ilParam)
	#forceref $_CHAT_hWnd, $_CHAT_iMsg, $_CHAT_iWParam, $_CHAT_ilParam

	_CHAT_UI_SetMouseHook()
	Return $GUI_RUNDEFMSG
EndFunc

Func _CHAT_WM_EXITSIZEMOVE($_CHAT_hWnd, $_CHAT_iMsg, $_CHAT_iwParam, $_CHAT_ilParam)
	#forceref $_CHAT_hWnd, $_CHAT_iMsg, $_CHAT_iWParam, $_CHAT_ilParam

	_CHAT_UI_SetMouseHook(1)
	Return $GUI_RUNDEFMSG
EndFunc

Func _CHAT_UI_SetMouseHook($_CHAT_DoWhat = 0)
	If Not IsDeclared("_CHAT_DoWhat") Then $_CHAT_Dowhat = 1
	Switch $_CHAT_Dowhat
		Case 1

			If $_CHAT_hMouseProc = -1 Then
				$_CHAT_hMouseProc = DllCallbackRegister("_CHAT_WM_MOUSEMOVE", "int", "uint;wparam;lparam")
			EndIf

			If $_CHAT_hMouseHook = -1 Then
				Local $_CHAT_hM_Module = _WinAPI_GetModuleHandle(0)
				$_CHAT_hMouseHook = _WinAPI_SetWindowsHookEx($WH_MOUSE_LL, DllCallbackGetPtr($_CHAT_hMouseProc), $_CHAT_hM_Module, 0)
			EndIf

		Case 0

			If $_CHAT_hMouseHook <> -1 Then
				_WinAPI_UnhookWindowsHookEx($_CHAT_hMouseHook)
				$_CHAT_hMouseHook = -1
			EndIf

			If $_CHAT_hMouseProc <> -1 Then
				DllCallbackFree($_CHAT_hMouseProc)
				$_CHAT_hMouseProc = -1
			EndIf

	EndSwitch
	Return
EndFunc

Func _CHAT_UI_SetWindowHook($_CHAT_DoWhat = 0); Thanks to rasim for this
	If Not IsDeclared("DoWhat") Then $_CHAT_Dowhat = 1
	Switch $_CHAT_Dowhat
		Case 1
			If $_CHAT_hWinEventProc = -1 Then
				$_CHAT_hWinEventProc = DllCallbackRegister("_CHAT_WinEventProc", "none", "hwnd;int;hwnd;long;long;int;int")
			EndIf
			If $_CHAT_hWindowsHook = -1 Then
				Local Const $_CHAT_EVENT_SYSTEM_FOREGROUND = 0x0003 ;An MSAA event indicating that the foreground window changed.
				Local Const $_CHAT_WINEVENT_OUTOFCONTEXT = 0x0
				$_CHAT_hWindowsHook = DllCall($_CHAT_hUSER32, "hwnd", "SetWinEventHook", _
						"uint", $_CHAT_EVENT_SYSTEM_FOREGROUND, _; Event Min
						"uint", $_CHAT_EVENT_SYSTEM_FOREGROUND, _; Event Max
						"hwnd", 0, _
						"ptr", DllCallbackGetPtr($_CHAT_hWinEventProc), _
						"int", 0, _
						"int", 0, _
						"uint", $_CHAT_WINEVENT_OUTOFCONTEXT)
				If @error Then Return SetError(@error, 0, 0)
				$_CHAT_hWindowsHook = $_CHAT_hWindowsHook[0]
			EndIf
		Case 0
			If $_CHAT_hWindowsHook <> -1 Then
				DllCall($_CHAT_hUSER32, "int", "UnhookWinEvent", "hwnd", $_CHAT_hWindowsHook)
			EndIf
			If $_CHAT_hWinEventProc <> -1 Then
				DllCallbackFree($_CHAT_hWinEventProc)
			EndIf
	EndSwitch
EndFunc   ;==>_SetWinEventHook

Func _CHAT_WinEventProc($_CHAT_hHook, $_CHAT_iEvent, $_CHAT_hWnd, $_CHAT_idObject, $_CHAT_idChild, $_CHAT_iEventThread, $_CHAT_iEventTime)
	#forceref $_CHAT_hHook, $_CHAT_iEvent, $_CHAT_idObject, $_CHAT_idChild, $_CHAT_iEventThread, $_CHAT_iEventTime
	Switch $_CHAT_hWnd
		Case $_CHAT_GUI
			_CHAT_UI_SetMouseHook(1)
			;DllCall("user32.dll", "int", "RedrawWindow", "hwnd", $_CHAT_hDragBar, "int", 0, "int", 0, "int", 1); Repaint the dragbar in case there was a forground window over us
			ConsoleWrite(">Hooked mouse." & @CR)
		Case Else
			_CHAT_UI_SetMouseHook(0)
			ConsoleWrite(">Unhooked mouse." & @CR)
	EndSwitch

	Return
EndFunc   ;==>_WinEventProc

Func _CHAT_WM_MOUSEMOVE($_CHAT_nCode, $_CHAT_wParam, $_CHAT_lParam)
	#forceref $_CHAT_nCode, $_CHAT_wParam, $_CHAT_lParam
	If $_CHAT_nCode < 0 Then
		Return _WinAPI_CallNextHookEx($_CHAT_hMouseHook, $_CHAT_nCode, $_CHAT_wParam, $_CHAT_lParam) ;let other hooks continue processing if any
	EndIf
	;If $_CHAT_nCode <> 0 Then ConsoleWrite($_CHAT_nCode & @CR)
	;If $_CHAT_BlockMessages Then Return 'GUI_RUNDEFMSG'

	Local $_CHAT_picpos
	Local $_CHAT_Error
	Local $_CHAT_tMOUSE
	Local $_CHAT_NewPos

	Switch $_CHAT_wParam
		Case $WM_LBUTTONUP; mouse up

			Switch $_CHAT_DragCtrl
				Case $_CHAT_Pic1, $_CHAT_Pic2

					_CHAT_saveSplitPos()
					_CHAT_ResizeControls()


			EndSwitch
			$_CHAT_DragCtrl = 0; need to unset control dragged or else we get many anomalies

		Case 512; mouse moving
			Switch $_CHAT_DragCtrl
				Case $_CHAT_Pic2


					$_CHAT_picpos = ControlGetPos($_CHAT_GUI, "", $_CHAT_pic2)
					$_CHAT_Error = @error
					$_CHAT_tMOUSE = DllStructCreate("uint x;uint y", $_CHAT_lParam)
					_WinAPI_ScreenToClient($_CHAT_GUI, $_CHAT_tMOUSE)

					$_CHAT_NewPos = DllStructGetData($_CHAT_tMOUSE, "y")
					$_CHAT_Error += @error
					If $_CHAT_Error + @error Then Return

					If DllStructGetData($_CHAT_tMOUSE, "x") > 0 And DllStructGetData($_CHAT_tMOUSE, "y") < ($_CHAT_GUIHEIGHT - $_CHAT_statusBarHeight - 5) Then

						If DllStructGetData($_CHAT_tMOUSE, "y") > ($_CHAT_GUIHEIGHT - $_CHAT_statusBarHeight - 6) Then
							$_CHAT_NewPos = ($_CHAT_GUIHEIGHT - $_CHAT_statusBarHeight - 5);keep the seperator looking nicely
							_WinAPI_SetWindowPos($_CHAT_hPic1, $HWND_TOP, $_CHAT_picpos[0], $_CHAT_NewPos, $_CHAT_picpos[2], $_CHAT_splitWidth, $SWP_SHOWWINDOW)
							Return _WinAPI_CallNextHookEx($_CHAT_hMouseHook, $_CHAT_nCode, $_CHAT_wParam, $_CHAT_lParam) ;Continue processing
						EndIf

						If DllStructGetData($_CHAT_tMOUSE, "y") < ($_CHAT_topMargin - 3) Then $_CHAT_NewPos = $_CHAT_topMargin; check top docking range

						_WinAPI_SetWindowPos($_CHAT_hPic2, $HWND_TOP, $_CHAT_picpos[0], $_CHAT_NewPos, $_CHAT_picpos[2], $_CHAT_splitWidth, $SWP_SHOWWINDOW)
						_CHAT_ResizeControls()

					EndIf


				Case $_CHAT_Pic1


					$_CHAT_picpos = ControlGetPos($_CHAT_GUI, "", $_CHAT_pic1)
					$_CHAT_Error = @error
					$_CHAT_tMOUSE = DllStructCreate("uint x;uint y", $_CHAT_lParam)
					_WinAPI_ScreenToClient($_CHAT_GUI, $_CHAT_tMOUSE)

					$_CHAT_NewPos = DllStructGetData($_CHAT_tMOUSE, "x")
					$_CHAT_Error += @error
					If $_CHAT_Error + @error Then Return

					If DllStructGetData($_CHAT_tMOUSE, "x") > 0 And DllStructGetData($_CHAT_tMOUSE, "y") < $_CHAT_GUIWidth Then

						If DllStructGetData($_CHAT_tMOUSE, "x") > ($_CHAT_GUIWidth-4) Then
							$_CHAT_NewPos = ($_CHAT_GUIWidth - 5);keep the seperator looking nicely

							_WinAPI_SetWindowPos($_CHAT_hPic1, $HWND_TOP, $_CHAT_NewPos, $_CHAT_picpos[1], $_CHAT_picpos[2], $_CHAT_splitWidth, $SWP_SHOWWINDOW)

							Return _WinAPI_CallNextHookEx($_CHAT_hMouseHook, $_CHAT_nCode, $_CHAT_wParam, $_CHAT_lParam) ;Continue processing
						EndIf

						If DllStructGetData($_CHAT_tMOUSE, "x") < ($_CHAT_rigthMargin - 5) Then $_CHAT_NewPos = $_CHAT_rigthMargin-5; check top docking range

						_WinAPI_SetWindowPos($_CHAT_hPic1, $HWND_TOP, $_CHAT_NewPos, $_CHAT_picpos[1], $_CHAT_picpos[2], $_CHAT_splitWidth, $SWP_SHOWWINDOW)

						_CHAT_ResizeControls()


					EndIf


			EndSwitch
		EndSwitch

	Return _WinAPI_CallNextHookEx($_CHAT_hMouseHook, $_CHAT_nCode, $_CHAT_wParam, $_CHAT_lParam) ;let other hooks continue processing if any
EndFunc   ;==>WM_MOUSEMOVE

Func _CHAT_WM_COMMAND($_CHAT_hWnd, $_CHAT_iMsg, $_CHAT_iwParam, $_CHAT_ilParam)
	#forceref $_CHAT_hwnd, $_CHAT_iMsg, $_CHAT_ilParam

	Local $_CHAT_LowWord = BitAND($_CHAT_iwParam, 0xFFFF)
	Switch $_CHAT_hWnd
		Case $_CHAT_GUI
			Switch $_CHAT_ilParam; win hwnd
				Case $_CHAT_hPic2; drag bar toggled
					;GUISetStyle($_CHAT_UI_Editor_Style, -1, $_CHAT_UI_Editor)
					$_CHAT_DragCtrl = $_CHAT_Pic2
					;ConsoleWrite("$_CHAT_DragCtrl2 toggled" & @CR)
				Case $_CHAT_hPic1; drag bar toggled
					;GUISetStyle($_CHAT_UI_Editor_Style, -1, $_CHAT_UI_Editor)
					$_CHAT_DragCtrl = $_CHAT_Pic1
					;ConsoleWrite("$_CHAT_DragCtrl1 toggled" & @CR)
				Case Else
					Switch $_CHAT_LowWord
						Case $_CHAT_M_ID_Connect
							_CHAT_Connect ()

						Case $_CHAT_M_ID_Disconnect
							_CHAT_Disconnect ()

					EndSwitch
			EndSwitch

	EndSwitch

	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_COMMAND

Func _CHAT_WM_GETMINMAXINFO($_CHAT_hWnd, $_CHAT_iMsg, $_CHAT_WPARAM, $_CHAT_LPARAM)
	#forceref $_CHAT_hwnd, $_CHAT_iMsg, $_CHAT_WPARAM
	Local $_CHAT_tagMaxinfo = DllStructCreate("int;int;int;int;int;int;int;int;int;int", $_CHAT_LPARAM)
	DllStructSetData($_CHAT_tagMaxinfo, 7, $_CHAT_GUIMINWID) ; min X
	DllStructSetData($_CHAT_tagMaxinfo, 8, $_CHAT_GUIMINHT) ; min Y
	DllStructSetData($_CHAT_tagMaxinfo, 9, 99999) ; max X
	DllStructSetData($_CHAT_tagMaxinfo, 10, 99999) ; max Y
	Return 'GUI_RUNDEFMSG'
EndFunc   ;==>WM_GETMINMAXINFO

Func _CHAT_saveSplitPos()
    Local $_CHAT_winpos = WinGetClientSize("")
    $_CHAT_GUIWidth=$_CHAT_winpos[0]
    $_CHAT_GUIHeight=$_CHAT_winpos[1]
    Local $_CHAT_splitpos1 = ControlGetPos("", "", $_CHAT_Pic1)
    $_CHAT_leftVSplit=$_CHAT_splitpos1[0]
    Local $_CHAT_splitpos2 = ControlGetPos("", "", $_CHAT_Pic2)
    $_CHAT_topHSplit=$_CHAT_splitpos2[1]
EndFunc

Func _CHAT_RESIZE_CONTROLS($_CHAT_hWnd, $_CHAT_Msg, $_CHAT_iwParam, $_CHAT_ilParam)
	#forceref $_CHAT_hWnd, $_CHAT_Msg, $_CHAT_iwParam
	Local $_CHAT_iGUIWidth = BitAND($_CHAT_ilParam, 0xFFFF)
	Local $_CHAT_iGUIHeight = BitShift($_CHAT_ilParam, 16)

    Local $_CHAT_Hcoef=($_CHAT_iGUIWidth-$_CHAT_leftMargin-$_CHAT_rigthMargin-$_CHAT_splitWidth)/($_CHAT_GUIWidth-$_CHAT_leftMargin-$_CHAT_rigthMargin-$_CHAT_splitWidth)
	Local $_CHAT_Vcoef = ($_CHAT_iGUIHeight - $_CHAT_topMargin - $_CHAT_bottomMargin - $_CHAT_splitWidth - $_CHAT_statusBarHeight) / ($_CHAT_GUIHEIGHT - $_CHAT_topMargin - $_CHAT_bottomMargin - $_CHAT_splitWidth - $_CHAT_statusBarHeight)

    GUICtrlSetPos($_CHAT_pic2,$_CHAT_leftMargin,$_CHAT_topMargin+($_CHAT_topHSplit-$_CHAT_topMargin)*$_CHAT_Vcoef,$_CHAT_iGUIWidth)
    GUICtrlSetPos($_CHAT_pic1,$_CHAT_leftMargin+($_CHAT_leftVSplit-$_CHAT_leftMargin)*$_CHAT_Hcoef,$_CHAT_topMargin,$_CHAT_splitWidth,($_CHAT_topHSplit-$_CHAT_topMargin)*$_CHAT_Vcoef)

    _CHAT_ResizeControls()

    Return $GUI_RUNDEFMSG
EndFunc

Func _CHAT_ResizeControls()
	$_CHAT_aParts[0] = $_CHAT_leftVSplit
	_GUICtrlStatusBar_SetParts($_CHAT_Status1, $_CHAT_aParts)
	_GuiCtrlStatusBar_Resize ($_CHAT_Status1)

    _CHAT_SplitterHort($_CHAT_ChatWindow, $_CHAT_UserList, $_CHAT_Send, $_CHAT_Pic2)
    _CHAT_SplitterVert($_CHAT_ChatWindow, $_CHAT_UserList, $_CHAT_Pic1, $_CHAT_Pic2)
EndFunc ;==>ResizeControls

Func _CHAT_SplitterVert($_CHAT_ctrl1, $_CHAT_ctrl2, $_CHAT_split1,$_CHAT_iop)
	#forceref $_CHAT_iop
    GUICtrlSetState($_CHAT_split1,$gui_hide);!!!
    Local $_CHAT_splitpos1 = ControlGetPos("", "", $_CHAT_split1)
	If @error Then Return
    Local $_CHAT_winpos = WinGetClientSize("")
	If @error Then Return

    GUICtrlSetPos($_CHAT_split1,$_CHAT_splitpos1[0],$_CHAT_splitpos1[1],$_CHAT_splitWidth,$_CHAT_splitpos1[3]);!!!

	_WinAPI_SetWindowPos($_CHAT_ctrl1, 0, $_CHAT_leftMargin, $_CHAT_splitpos1[1], ($_CHAT_splitpos1[0] - $_CHAT_leftMargin), $_CHAT_splitpos1[3], $SWP_SHOWWINDOW)

    GUICtrlSetPos($_CHAT_ctrl2, $_CHAT_splitpos1[0] + $_CHAT_splitWidth, _
            $_CHAT_splitpos1[1], _
            $_CHAT_winpos[0] -$_CHAT_rigthMargin- $_CHAT_splitpos1[0] - $_CHAT_splitWidth, _
            $_CHAT_splitpos1[3])
    GUICtrlSetState($_CHAT_split1,$gui_show);!!!
EndFunc ;==>SplitterVert

Func _CHAT_SplitterHort($_CHAT_ctrl1, $_CHAT_ctrl2, $_CHAT_ctrl3, $_CHAT_split)
    Local $_CHAT_splitpos = ControlGetPos("", "", $_CHAT_split)
	If @error Then Return
    Local $_CHAT_splitpic1 = ControlGetPos("", "", $_CHAT_pic1);!!!
	If @error Then Return
    $_CHAT_splitpos[3]=$_CHAT_splitWidth
    GUICtrlSetPos($_CHAT_split,$_CHAT_splitpos[0],$_CHAT_splitpos[1],$_CHAT_splitpos[2],$_CHAT_splitWidth);!!!
    GUICtrlSetState($_CHAT_split,$gui_hide);!!!

    Local $_CHAT_winpos = WinGetClientSize("")

    Local $_CHAT_nh = $_CHAT_splitpos[1]-$_CHAT_topMargin;jcd - 9

	_WinAPI_SetWindowPos($_CHAT_ctrl1, 0, $_CHAT_leftMargin, $_CHAT_topMargin, $_CHAT_splitpic1[0]-$_CHAT_leftMargin,$_CHAT_nh, $SWP_SHOWWINDOW)

    GUICtrlSetPos($_CHAT_ctrl2, $_CHAT_splitpic1[0]+$_CHAT_splitWidth,$_CHAT_topMargin,$_CHAT_winpos[0]-$_CHAT_rigthMargin-($_CHAT_splitpic1[0]+$_CHAT_splitWidth),$_CHAT_nh)

    Local $_CHAT_top = $_CHAT_splitpos[1] + $_CHAT_splitWidth
    GUICtrlSetPos($_CHAT_pic1, $_CHAT_splitpic1[0], $_CHAT_splitpic1[1], $_CHAT_splitpic1[2], $_CHAT_nh);!!!

    $_CHAT_nh = $_CHAT_winpos[1] - $_CHAT_top - $_CHAT_bottomMargin-$_CHAT_statusBarHeight; move this up above the status bar

    GUICtrlSetPos($_CHAT_ctrl3, $_CHAT_leftMargin, _
                              $_CHAT_top, _
                            $_CHAT_winpos[0]-$_CHAT_leftMargin-$_CHAT_rigthMargin, _
                            $_CHAT_nh)

    GUICtrlSetState($_CHAT_split,$gui_show);!!!
EndFunc ;==>SplitterHort

#EndRegion - GUI MANAGMENT -

Func _CHAT_EXIT()

	DllCall($_CHAT_hKERNEL32, "int", "ReleaseMutex", "long", $_CHAT_Mutex)
	DllCall($_CHAT_hKERNEL32, "int", "CloseHandle", "long", $_CHAT_Mutex)

	;GUIRegisterMsg($_CHAT_WM_SIZE,"")

	_CHAT_UI_SetWindowHook()
	_CHAT_UI_SetMouseHook()

	GUIDelete($_CHAT_GUI)

	OnAutoItExitUnRegister("_CHAT_EXIT"); must do after everything else to prevent crash :D

	DllClose($_CHAT_hKERNEL32)
	DllClose($_CHAT_hUSER32)

	TCPShutdown ()

	Exit
EndFunc
