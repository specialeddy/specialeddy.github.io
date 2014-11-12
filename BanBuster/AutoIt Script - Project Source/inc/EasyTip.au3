#include-once
#include <GUIToolTip.au3>

; #FUNCTION# ====================================================================================================================
; Name ..........: _GuiCtrlSetTip
; Description ...: Easy to use wrapper for the GUIToolTip UDF.
; Syntax ........: _GuiCtrlSetTip($hControl, $sText[, $sTitle = ""[, $iIcon = 0[, $iOptions = 0[, $iBackGroundColor = -1[,
;                  $itextColor = -1[, $iDelay = 500]]]]]])
; Parameters ....: $hControl            - A handle to the control, use -1 to assign to the last recently created control.
;                  $sText               - Tip text that will be displayed when the mouse is hovered over the control.
;                  $sTitle              - [optional] The title for the tooltip Requires IE5+
;                  $iIcon               - [optional] Pre-defined icon to show next to the title: Requires IE5+. Requires a title.
;                                        	 | 0 = No icon
;											 | 1 = Info icon
;											 | 2 = Warning icon
; 											 | 3 = Error Icon
;                                        	 | - This parameter can also be a string in the below example format~
;                                        	 | [@WindowsDir & "\Explorer.exe,100"] where 100 is the icon index in the file that
;                                        	 | contains the icon resource to use, this can be any file with icon resources.
;                  $iOptions            - [optional] Sets different options for how the tooltip will be displayed
;											 | (Can be added together):
;											 | 1 = Display as Balloon Tip Requires IE5+
;											 | 2 = Center the tip horizontally along the control.
;                  $iBackGroundColor    - [optional] A hex RGB color value to use for the tip background color.
;                  $itextColor          - [optional] A hex RGB color value to use for the tip text color.
;                  $iDelay              - [optional] A positive vale in miliseconds to set the tips delay time. Default is 500.
; Return values .: The newly created tooltip handle
; Author ........: THAT1ANONYMOUSDUDE
; Modified ......:
; Remarks .......: Just a wrapper for the GUIToolTip UDF.
; Related .......: None
; Link ..........:
; Example .......: _GUICtrlSetTip(-1,"Test tip with text, title, Icon & balloon style.","Optional title",1,1)
; ===============================================================================================================================
Func _GuiCtrlSetTip($hControl, $sText, $sTitle = "", $iIcon = 0, $iOptions = 0, $iBackGroundColor = -1, $itextColor = -1, $iDelay = 500)
	If Not IsHWnd($hControl) Then $hControl = GUICtrlGetHandle($hControl)
	If Not IsHWnd($hControl) Then Return SetError(1, 0, 0)
	If $sText = "" Then Return SetError(1, 0, 0)
	Local $hicon, $Ret
	Local $ExtStyle = 0
	Switch $iOptions
		Case 0
			$iOptions = 9
			$ExtStyle = 0
		Case 1
			$iOptions = 9
			$ExtStyle = $TTS_BALLOON
		Case 2
			$iOptions = 11
			$ExtStyle = 0
		Case 3
			$iOptions = 11
			$ExtStyle = $TTS_BALLOON
		Case Else
			$iOptions = 9
	EndSwitch
	Local $hToolTip = _GUIToolTip_Create($hControl, BitOR($ExtStyle, $TTS_ALWAYSTIP, $TTS_NOPREFIX))
	_GUIToolTip_AddTool($hToolTip, 0, $sText, $hControl, 0, 0, 0, 0, $iOptions, 0)
	$hicon = DllStructCreate('ptr')
	If IsNumber($iIcon) And $iIcon <= 3 Then
		Switch $iIcon
			Case 1
				$iIcon = -104
			Case 2
				$iIcon = -101
			Case 3
				$iIcon = -103
			Case Else
				$iIcon = 0
		EndSwitch
		If $iIcon <> 0 Then
			$Ret = DllCall('shell32.dll', 'uint', 'ExtractIconExW', 'wstr', @SystemDir & "\user32.dll", 'int', $iIcon, 'ptr', 0, 'ptr', DllStructGetPtr($hicon), 'uint', 1)
			If Not @error And $Ret[0] Then
				$hicon = DllStructGetData($hicon, 1)
			Else
				$hicon = 0
			EndIf
		Else
			$hicon = 0
		EndIf
		_GUIToolTip_SetTitle($hToolTip, $sTitle, $hicon)
		DllCall("user32.dll", "bool", "DestroyIcon", "handle", $hIcon)
	Else
		$iIcon = StringSplit($iIcon, ",")
		If $iIcon[0] > 1 Then
			$Ret = DllCall('shell32.dll', 'uint', 'ExtractIconExW', 'wstr', $iIcon[$iIcon[0] - 1], 'int', -1 * (Int($iIcon[$iIcon[0]])), 'ptr', 0, 'ptr', DllStructGetPtr($hicon), 'uint', 1)
			If Not @error And $Ret[0] Then
				$hicon = DllStructGetData($hicon, 1)

			Else
				$hicon = 0
			EndIf

			_GUIToolTip_SetTitle($hToolTip, $sTitle, $hicon)
			DllCall("user32.dll", "bool", "DestroyIcon", "handle", $hIcon)
		Else
			_GUIToolTip_SetTitle($hToolTip, $sTitle)
		EndIf
	EndIf

	If $iBackGroundColor <> -1 Or $itextColor <> -1 Then DllCall("UxTheme.dll", "int", "SetWindowTheme", "hwnd", $hToolTip, "wstr", "", "wstr", "")
	If $iBackGroundColor <> -1 Then _GUIToolTip_SetTipBkColor($hToolTip, $iBackGroundColor)
	If $itextColor <> -1 Then _GUIToolTip_SetTipTextColor($hToolTip, $itextColor)
	_GUIToolTip_SetDelayTime($hToolTip, 0, $iDelay)
	Return $hToolTip
EndFunc   ;==>_GuiCtrlSetTip

