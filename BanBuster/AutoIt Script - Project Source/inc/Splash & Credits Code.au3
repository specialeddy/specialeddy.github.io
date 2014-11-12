#include-once

#Region - SplashScreen Code -

Global $FillModeWinding = 1
Global $GDIP_STATUS


Func _Logo_Startup()
	Local $i_width, $i_height, $Img

	$i_width = 636;_GDIPlus_ImageGetWidth($__gImageStartup_Logo)
	$i_height = 329;_GDIPlus_ImageGetHeight($__gImageStartup_Logo)
	Local $__gPNG_Logo = GUICreate("", $i_width, $i_height, -1, -1, $WS_POPUP, BitOR($WS_EX_LAYERED, $WS_EX_TOOLWINDOW))

	If @Compiled Then
		$Img = Load_BMP_From_Mem(Binary(_ResourceGetAsRaw(@ScriptFullPath, 10, "SPLASH", 1033, 1)))
		$FileVersion = "v" & FileGetVersion(@ScriptFullPath, "FileVersion")
	Else
		$Img = Load_BMP_From_Mem(Binary(FileRead(@ScriptDir & "\BBLogo.png")))
		$FileVersion = "DevMode"
	EndIf

	__Logo_SetBitmap($__gPNG_Logo, $Img, 0)
	GUISetState()
	;WinSetOnTop($__gPNG_Logo, "", 1)

	Local $__gGUI_Controls_Logo = GUICreate("", $i_width, $i_height, -1, -1, $WS_POPUP, BitOR($WS_EX_LAYERED, $WS_EX_MDICHILD, $WS_EX_TOOLWINDOW), $__gPNG_Logo)
	GUISetBkColor(0xFFFFFE)
	_WinAPI_SetLayeredWindowAttributes($__gGUI_Controls_Logo, 0xFFFFFE)

	Local $versioninfo = GUICtrlCreateLabel($FileVersion, 378, 140, 190, 50, 1, -1)
	GUICtrlSetFont($versioninfo, 26, 800, "", "Tahoma")
	GUICtrlSetColor($versioninfo, 0x880000)
	$ProgressLabel = GUICtrlCreateLabel("", 185, 287, 250, 16, 1, -1)
	GUICtrlSetColor($ProgressLabel, 0x880000)
	GUICtrlSetFont($ProgressLabel, 8, $FW_BOLD  , '', "Tahoma", $PROOF_QUALITY)
	GUISetState(@SW_SHOW, $__gGUI_Controls_Logo)

	For $I = 0 to 255 Step 10
		__Logo_SetBitmap($__gPNG_Logo, $Img, $I)
		Sleep(10)
	Next

	_WinAPI_DeleteObject($Img)

	Return $__gPNG_Logo
EndFunc   ;==>_Logo_Startup

; #INTERNAL FUNCTION# ;======================================================================
;
; Name...........: __Logo_SetBitmap
; Description ...: Sets transparency of an GUI Background
; Syntax.........: __Logo_SetBitmap($hGui, $hImage, $iOpacity)
; Parameters ....: $hGui 		- GUI to set transparency
;                  $hImage		- Image to set transparency
;                  $iOpacity	- Transparency to set (0-255)
; Return values .: Success - Return 1
; Author ........: TheLuBu (LuBu@veytal.com)
; Modified.......:
; Remarks .......:
; Related .......:
; Link ..........:
;
; ;==========================================================================================
Func __Logo_SetBitmap($hGui, $hImage, $iOpacity)
	Local $hScrDC, $hMemDC, $hBitmap, $hOld, $pSize, $tSize, $pSource, $tSource, $pBlend, $tBlend
	$hScrDC = _WinAPI_GetDC(0)
	$hMemDC = _WinAPI_CreateCompatibleDC($hScrDC)
	$hBitmap = _GDIPlus_BitmapCreateHBITMAPFromBitmap($hImage)
	$hOld = _WinAPI_SelectObject($hMemDC, $hBitmap)
	$tSize = DllStructCreate($tagSIZE)
	$pSize = DllStructGetPtr($tSize)
	DllStructSetData($tSize, "X", _GDIPlus_ImageGetWidth($hImage))
	DllStructSetData($tSize, "Y", _GDIPlus_ImageGetHeight($hImage))
	$tSource = DllStructCreate($tagPOINT)
	$pSource = DllStructGetPtr($tSource)
	$tBlend = DllStructCreate($tagBLENDFUNCTION)
	$pBlend = DllStructGetPtr($tBlend)
	DllStructSetData($tBlend, "Alpha", $iOpacity)
	Local $AC_SRC_ALPHA = 1
	DllStructSetData($tBlend, "Format", $AC_SRC_ALPHA)
	_WinAPI_UpdateLayeredWindow($hGui, $hScrDC, 0, $pSize, $hMemDC, $pSource, 0, $pBlend, $ULW_ALPHA)
	_WinAPI_ReleaseDC(0, $hScrDC)
	_WinAPI_SelectObject($hMemDC, $hOld)
	_WinAPI_DeleteObject($hBitmap)
	_WinAPI_DeleteDC($hMemDC)
	Return 1
EndFunc   ;==>__Logo_SetBitmap

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
    $aResult = DllCall("GDIPlus.dll", "uint", "GdipCreateBitmapFromStream", "ptr", $hStream, "int*", 0) ;Creates a Bitmap object based on an IStream COM interface
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
    $Ret = DllCall("GDIPlus.dll", 'uint', 'GdipGetImageDimension', 'ptr', $hBitmap, 'float*', 0, 'float*', 0)
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

#EndRegion - SplashScreen Code -

#Region - Credits -
;Everything below should be ignored since it's just variable data for the credits thing in the about section
Global $ParantPos
Global $TabArea

Global $iWidth
Global $iHeight
Global $nTextSize = 64, $nTextWidth = 1600
Global $iStep, $iCnt, $nLogoSize, $iTextY, $iTextIndex, $iBkgY, $iEOff

Global $aStar[21][5]
Global $aPoints[5][2]

Global $hSound = 0;_SoundOpen(@ScriptDir & "\Intro.mp3")
Global $hGui

Global $hGraphics
Global $hBitmap
Global $hContext
Global $hBrushStar
Global $hBrushText
Global $hBrushWhite
Global $hBrushEnd
Global $hBitmapLogo
Global $hCollection
Global $tFont
Global $hFamily
Global $hFormat
Global $hBitmapBkg
Global $hBitmapFar
Global $hTextPath
Global $aText
Global $aBounds
Global $hEndPath

;Global $FillModeWinding = 1; declared in gdipconstants.au3

Global $StopCreditsShow = True; used to stop credits show
; end credits var data

Func _Showcredits()
	AdlibUnRegister("_Showcredits")
	If $IsInOperation Then Return
	_DisableResizing(1)
	$ParantPos = WinGetPos($BANEVADER)
	If @error Then Return;avoid crashing since using adlib that might make a call to function when script is exiting and cause subscript error due to missing GUI.... lol, quick dirty fix, ftw.
	$TabArea = _GUICtrlTab_GetDisplayRect(GUICtrlGetHandle($Tab1))

	$iWidth = $TabArea[2]-1
	$iHeight = $TabArea[3]-20

	$iStep = 0
	$iCnt = 0
	$nLogoSize = 1
	$iTextY = -800
	$iTextIndex = 1
	$iBkgY = 0
	$iEOff = $iWidth / 300

	Dim $aStar[21][5] = [[20]]
	Dim $aPoints[5][2] = [[4, 0],[Round($iWidth * 0.4), Round($iHeight * 0.25)],[Round($iWidth - $iWidth * 0.4), Round($iHeight * 0.25)],[0, $iHeight],[$iWidth, $iHeight]]

	$hGui = GUICreate("StarWars", $iWidth , $iHeight, $TabArea[0]+$ParantPos[0]+1, $TabArea[1]+$ParantPos[1]+30, $WS_POPUP, -1, $BANEVADER)

	$hGraphics = _GDIPlus_GraphicsCreateFromHWND($hGui)
	_GDIPlus_GraphicsSetSmoothingMode($hGraphics, 0)
	_GDIPlus_GraphicsClear($hGraphics, 0xFF000000)
	$hBitmap = _GDIPlus_BitmapCreateFromGraphics($iWidth, $iHeight, $hGraphics)
	$hContext = _GDIPlus_ImageGetGraphicsContext($hBitmap)
	_GDIPlus_GraphicsSetSmoothingMode($hContext, 2)
	_GDIPlus_GraphicsClear($hContext, 0xFF000000)

	$hBrushStar = _GDIPlus_BrushCreateSolid(0x88FFFFFF)
	$hBrushText = _GDIPlus_LineBrushCreate(0, 0, 0, $iHeight, 0x99E5B13A, 0xFFE5B13A)
	$hBrushWhite = _GDIPlus_BrushCreateSolid(0x00FFFFFF)
	$hBrushEnd = _GDIPlus_BrushCreateSolid(0x05FFAA00)

	$hBitmapLogo = _CreateLogoBitmap($hGraphics, 120, '/B/an', 0, -70, 'Buster', 90, 90)

	$hCollection = _GDIPlus_PrivateCollectionCreate()
	$tFont = DllStructCreate('byte[' & BinaryLen($bFont_FRANKLIN) & ']')
	DllStructSetData($tFont, 1, $bFont_FRANKLIN)
	_GDIPlus_PrivateCollectionAddMemoryFont($hCollection, DllStructGetPtr($tFont), DllStructGetSize($tFont))
	$hFamily = _GDIPlus_CreateFontFamilyFromName('Franklin Gothic Medium', $hCollection)
	$hFormat = _GDIPlus_StringFormatCreate()

	$hBitmapBkg = _CreateBkgBitmap($hGraphics, $iWidth, $iHeight, 3000)
	$hBitmapFar = _CreateFarfarBitmap($hGraphics, "A long time ago, in a galaxy far,", "far away...")

	$hTextPath = _CreateTextPath($hGraphics, "ScriptKitty Presents", "BanBuster "&$FileVersion, $nTextWidth, $nTextSize)
	$aText = _SplitText($hGraphics, $Credits, $nTextWidth, $nTextSize)

	$aBounds = _GDIPlus_PathGetWorldBounds($hTextPath)

	$hEndPath = _CreateEndPath("Houston, Texas.")

	GUISetState(@SW_SHOW, $hGui)

	Local $iTimer = TimerInit()
	While $StopCreditsShow = False
		Sleep(1)
		If ($iStep < 5 And TimerDiff($iTimer) > 75) Or ($iStep >= 5 And TimerDiff($iTimer) > 25) Then
			$iTimer = TimerInit()
			Switch $iStep
				Case 0
					$iCnt += 1
					If $iCnt > 90 Then
						$iCnt = 10
						$iStep = 1
						;_SoundPlay($hSound)
						Sleep(150)
						ContinueCase
					EndIf
				Case 1
					$iCnt -= $iCnt * 0.04
					$nLogoSize = 2 ^ Log($iCnt)
					If $iCnt <= 0.1 Then $iStep = 2
				Case 2
					$iCnt -= $iCnt * 0.04
					$nLogoSize = 2 ^ Log($iCnt)
					$iTextY += 1.6
					If $iCnt <= 0.01 Then $iStep = 3
				Case 3
					$iTextY += 1.6
					$iCnt = 0xAA
					If $iTextY > 1400 Then $iStep = 4
				Case 4
					$iTextY += 1.6
					$iCnt -= 1
					_GDIPlus_BrushDispose($hBrushText)
					$hBrushText = _GDIPlus_BrushCreateSolid(BitOR(BitShift($iCnt, -24), 0x00E5B13A))
					If $iCnt < 0x01 Then
						$iStep = 5
						$iCnt = 0x00
					EndIf
				Case 5
					$iBkgY -= 2
					If $iBkgY < -100 And $iCnt < 0xFF Then
						$iCnt += 3
						_GDIPlus_BrushDispose($hBrushWhite)
						$hBrushWhite = _GDIPlus_BrushCreateSolid(BitOR(BitShift($iCnt, -24), 0x00FFFFFF))
					EndIf
					If $iBkgY < -400 Then
						$iStep = 6
						$iCnt = 0
						$aBounds = _GDIPlus_PathGetWorldBounds($hEndPath)
						$aPoints[1][0] = $iWidth * 0.3
						$aPoints[1][1] = $iHeight * 0.4
						$aPoints[2][0] = $iWidth * 0.7
						$aPoints[2][1] = $iHeight * 0.4
						$aPoints[3][0] = $iWidth * 0.28
						$aPoints[3][1] = $iHeight * 0.6
						$aPoints[4][0] = $iWidth * 0.72
						$aPoints[4][1] = $iHeight * 0.6
					EndIf
				Case 6
					$iCnt += 1
					If $iCnt > 100 Then Return _ExitCredits()
			EndSwitch
			Sleep(1)
			_ReDraw()
		EndIf
	WEnd
	_ExitCredits()
	Return 1
EndFunc

Func _ReDraw()
	If $iStep < 6 Then _GDIPlus_GraphicsDrawImage($hContext, $hBitmapBkg, 0, $iBkgY)
	If $iStep < 5 Then
		For $i = 1 To $aStar[0][0]
			$aStar[$i][3] += 1
			If $aStar[$i][3] > $aStar[$i][4] Then
				$aStar[$i][0] = Random(0, $iWidth, 1)
				$aStar[$i][1] = Random(0, $iHeight, 1)
				$aStar[$i][2] = Random(1, 3, 1)
				$aStar[$i][3] = 0
				$aStar[$i][4] = Random(5, 25, 1)
			EndIf
			_GDIPlus_GraphicsFillEllipse($hContext, $aStar[$i][0], $aStar[$i][1], $aStar[$i][2], $aStar[$i][2], $hBrushStar)
		Next
	EndIf
	Local $hPathClone
	Switch $iStep
		Case 0
			_GDIPlus_GraphicsDrawImage($hContext, $hBitmapFar, 0, 0)
		Case 1
			_GDIPlus_GraphicsDrawImageRect($hContext, $hBitmapLogo, $iWidth / 2 - ((400) * $nLogoSize), $iHeight * 0.4 - ((200) * $nLogoSize), 800 * $nLogoSize, 400 * $nLogoSize)
		Case 2
			_GDIPlus_GraphicsDrawImageRectRectTrans($hContext, $hBitmapLogo, 0, 0, 800, 400, $iWidth / 2 - ((400) * $nLogoSize), $iHeight * 0.4 - ((200) * $nLogoSize), 800 * $nLogoSize, 400 * $nLogoSize, 2, $iCnt * 10)
			$hPathClone = _GDIPlus_PathClone($hTextPath)
			_GDIPlus_PathWarp($hPathClone, 0, $aPoints, $aBounds[0], $aBounds[1] + $iTextY, $aBounds[2], 800)
			_GDIPlus_GraphicsFillPath($hContext, $hPathClone, $hBrushText)
			_GDIPlus_PathDispose($hPathClone)
		Case 3, 4
			$hPathClone = _GDIPlus_PathClone($hTextPath)
			_GDIPlus_PathWarp($hPathClone, 0, $aPoints, $aBounds[0], $aBounds[1] + $iTextY, $aBounds[2], 800)
			_GDIPlus_GraphicsFillPath($hContext, $hPathClone, $hBrushText)
			_GDIPlus_PathDispose($hPathClone)
		Case 5
			_GDIPlus_GraphicsDrawImage($hContext, $hBitmapBkg, 0, $iBkgY + $iHeight)
			_GDIPlus_GraphicsFillRect($hContext, 0, 0, $iWidth, $iHeight, $hBrushWhite)
		Case 6
			$hPathClone = _GDIPlus_PathClone($hEndPath)
			_GDIPlus_PathWarp($hPathClone, 0, $aPoints, $aBounds[0] + Random(-$iEOff, $iEOff, 1), $aBounds[1] + Random(-$iEOff, $iEOff, 1), $aBounds[2], $aBounds[3])
			_GDIPlus_GraphicsFillPath($hContext, $hPathClone, $hBrushEnd)
			_GDIPlus_PathDispose($hPathClone)
	EndSwitch
	If $iTextIndex <= $aText[0] Then
		Switch $iStep
			Case 2, 3
				$hPathClone = _GDIPlus_PathClone($hTextPath)
				Local $tLayout = _GDIPlus_RectFCreate(0, $iTextIndex * $nTextSize + $nTextSize * 3, 0, 0)
				_GDIPlus_PathAddString($hPathClone, $aText[$iTextIndex], $tLayout, $hFamily, 0, $nTextSize, $hFormat)
				_GDIPlus_PathWarp($hPathClone, 0, $aPoints, $aBounds[0], $aBounds[1] + $iTextY, $aBounds[2], 800)
				Local $aBoundsTemp = _GDIPlus_PathGetWorldBounds($hPathClone)
				If $aBoundsTemp[0] > -500 Then
					_GDIPlus_PathAddString($hTextPath, $aText[$iTextIndex], $tLayout, $hFamily, 0, $nTextSize, $hFormat)
					$iTextIndex += 1
				EndIf
				_GDIPlus_PathDispose($hPathClone)
		EndSwitch
	EndIf
	_GDIPlus_GraphicsDrawImage($hGraphics, $hBitmap, 0, 0)
EndFunc   ;==>_ReDraw

Func _CreateTextPath($hGraphics, $sTextEpisode, $sTextHead, $iMax = 1200, $nSize = 65)
	Local $hPath = _GDIPlus_PathCreate($FillModeWinding)
	Local $tLayout, $aInfo, $hFont
	$hFont = _GDIPlus_FontCreate($hFamily, $nSize * 1.4)
	$tLayout = _GDIPlus_RectFCreate(0, 0, 0, 0)
	$aInfo = _GDIPlus_GraphicsMeasureString($hGraphics, $sTextEpisode, $hFont, $tLayout, $hFormat)
	$tLayout = _GDIPlus_RectFCreate(Round($iMax / 2 - DllStructGetData($aInfo[0], 3) / 2), 0, 0, 0)
	_GDIPlus_PathAddString($hPath, $sTextEpisode, $tLayout, $hFamily, 0, $nSize * 1.1, $hFormat)
	_GDIPlus_FontDispose($hFont)
	$hFont = _GDIPlus_FontCreate($hFamily, $nSize * 1.8)
	$tLayout = _GDIPlus_RectFCreate(0, 0, 0, 0)
	$aInfo = _GDIPlus_GraphicsMeasureString($hGraphics, $sTextHead, $hFont, $tLayout, $hFormat)
	$tLayout = _GDIPlus_RectFCreate(Round($iMax / 2 - DllStructGetData($aInfo[0], 3) / 2), $nSize * 1.2, 0, 0)
	_GDIPlus_PathAddString($hPath, $sTextHead, $tLayout, $hFamily, 0, $nSize * 1.8, $hFormat)
	_GDIPlus_FontDispose($hFont)
	Return $hPath
EndFunc   ;==>_CreateTextPath

Func _CreateEndPath($sText, $nSize = 65)
	Local $hPath = _GDIPlus_PathCreate($FillModeWinding)
	Local $tLayout = _GDIPlus_RectFCreate(0, 0, 0, 0)
	_GDIPlus_PathAddString($hPath, $sText, $tLayout, $hFamily, 0, $nSize, $hFormat)
	Return $hPath
EndFunc   ;==>_CreateEndPath

Func _SplitText($hGraphics, $sText, $iMax, $nSize)
	Local $aReturn[1] = [0], $iCnt = 0
	Local $hFont = _GDIPlus_FontCreate($hFamily, $nSize, 0)
	Local $tLayout, $aInfo
	Local $aSplit = StringSplit($sText, " "), $sLine, $sTemp = ""
	$tLayout = _GDIPlus_RectFCreate(0, 0, 0, 0)
	For $i = 1 To $aSplit[0]
		$sLine = $sTemp
		$sTemp &= $aSplit[$i] & " "
		$aInfo = _GDIPlus_GraphicsMeasureString($hGraphics, $sTemp, $hFont, $tLayout, $hFormat)
		If DllStructGetData($aInfo[0], 3) > $iMax Or $aSplit[$i] = "|" Or $i = $aSplit[0] Then
			If $sLine Then
				$iCnt += 1
				ReDim $aReturn[$iCnt + 1]
				$aReturn[$iCnt] = StringTrimRight($sLine, 1)
				$aReturn[0] = $iCnt
				$sTemp = $aSplit[$i] & " "
			EndIf
			If $aSplit[$i] = "|" Then
				$sTemp = ""
				$iCnt += 1
				ReDim $aReturn[$iCnt + 1]
				$aReturn[$iCnt] = ""
				$aReturn[0] = $iCnt
			EndIf
			If $aSplit[0] = $i Then
				If DllStructGetData($aInfo[0], 3) > $iMax Then
					$iCnt += 1
					ReDim $aReturn[$iCnt + 1]
					$aReturn[$iCnt] = $aSplit[$aSplit[0]]
					$aReturn[0] = $iCnt
				Else
					$aReturn[$iCnt] &= " " & $aSplit[$aSplit[0]]
				EndIf
			EndIf
		EndIf
	Next
	For $i = 1 To $aReturn[0]
		If Not $aReturn[$i] Or $i = $aReturn[0] Or Not $aReturn[$i + 1] Then ContinueLoop
		Do
			$sLine = $aReturn[$i]
			_AddSpace($aReturn[$i])
			$aInfo = _GDIPlus_GraphicsMeasureString($hGraphics, $sLine, $hFont, $tLayout, $hFormat)
		Until DllStructGetData($aInfo[0], 3) > $iMax
		$aReturn[$i] = $sLine
	Next
	_GDIPlus_FontDispose($hFont)
	Return $aReturn
EndFunc   ;==>_SplitText

Func _AddSpace(ByRef $sString)
	Local $sPattern, $sNeu = "", $iCnt = 1
	If Not StringInStr($sString, " ") Then Return
	Do
		$sPattern = "([^\h]\h{" & $iCnt & "})(?=[^\h])"
		If StringRegExp($sString, $sPattern) Then
			$sNeu = StringRegExpReplace($sString, $sPattern, "$1 ", 1)
		Else
			$iCnt += 1
		EndIf
	Until $sNeu
	$sString = $sNeu
EndFunc   ;==>_AddSpace

Func _CreateFarfarBitmap($hGraphics, $sText, $sText2)
	Local $hBitmap = _GDIPlus_BitmapCreateFromGraphics($iWidth, $iHeight, $hGraphics)
	Local $hContext = _GDIPlus_ImageGetGraphicsContext($hBitmap)
	Local $hBrush = _GDIPlus_BrushCreateSolid(0xFF4BD5EE)
	Local $hFont = _GDIPlus_FontCreate($hFamily, $iHeight / 20, 0)
	Local $tLayout, $aInfo, $iX
	$tLayout = _GDIPlus_RectFCreate(0, 0, 0, 0)
	$aInfo = _GDIPlus_GraphicsMeasureString($hContext, $sText, $hFont, $tLayout, $hFormat)
	DllStructSetData($aInfo[0], 1, Round($iWidth / 2 - DllStructGetData($aInfo[0], 3) / 2))
	$iX = DllStructGetData($aInfo[0], 1)
	DllStructSetData($aInfo[0], 2, Round($iHeight / 2 - DllStructGetData($aInfo[0], 4)))
	_GDIPlus_GraphicsDrawStringEx($hContext, $sText, $hFont, $aInfo[0], $hFormat, $hBrush)
	$tLayout = _GDIPlus_RectFCreate($iX, $iHeight / 2, 0, 0)
	$aInfo = _GDIPlus_GraphicsMeasureString($hContext, $sText2, $hFont, $tLayout, $hFormat)
	_GDIPlus_GraphicsDrawStringEx($hContext, $sText2, $hFont, $aInfo[0], $hFormat, $hBrush)
	_GDIPlus_FontDispose($hFont)
	_GDIPlus_BrushDispose($hBrush)
	_GDIPlus_GraphicsDispose($hContext)
	Return $hBitmap
EndFunc   ;==>_CreateFarfarBitmap

Func _CreateLogoBitmap($hGraphics, $iSize, $sString1, $iOffsetX1, $iOffsetY1, $sString2, $iOffsetX2, $iOffsetY2)
	Local $hBitmap = _GDIPlus_BitmapCreateFromGraphics(800, 400, $hGraphics)
	Local $hContext = _GDIPlus_ImageGetGraphicsContext($hBitmap)
	Local $hBrush = _GDIPlus_BrushCreateSolid(0xFFE5B13A)
	Local $hBrushBlack = _GDIPlus_BrushCreateSolid(0xFF000000)
	Local $hFormat = _GDIPlus_StringFormatCreate()
	Local $hCollection = _GDIPlus_PrivateCollectionCreate()
	Local $tFont = DllStructCreate('byte[' & BinaryLen($bFont_STARJEDI) & ']')
	DllStructSetData($tFont, 1, $bFont_STARJEDI)
	_GDIPlus_PrivateCollectionAddMemoryFont($hCollection, DllStructGetPtr($tFont), DllStructGetSize($tFont))
	Local $hFamily = _GDIPlus_CreateFontFamilyFromName('Star Jedi', $hCollection)
	Local $hFont = _GDIPlus_FontCreate($hFamily, $iSize, 0)
	Local $tLayout, $aInfo
	For $i = -8 To 8
		For $j = -8 To 8
			$tLayout = _GDIPlus_RectFCreate($iOffsetX1 + $i, $iOffsetY1 + $j, 0, 0)
			$aInfo = _GDIPlus_GraphicsMeasureString($hContext, $sString1, $hFont, $tLayout, $hFormat)
			_GDIPlus_GraphicsDrawStringEx($hContext, $sString1, $hFont, $aInfo[0], $hFormat, $hBrush)
		Next
	Next
	$tLayout = _GDIPlus_RectFCreate($iOffsetX1, $iOffsetY1, 0, 0)
	$aInfo = _GDIPlus_GraphicsMeasureString($hContext, $sString1, $hFont, $tLayout, $hFormat)
	_GDIPlus_GraphicsDrawStringEx($hContext, $sString1, $hFont, $aInfo[0], $hFormat, $hBrushBlack)
	For $i = -8 To 8
		For $j = -8 To 8
			$tLayout = _GDIPlus_RectFCreate($iOffsetX2 + $i, $iOffsetY2 + $j, 0, 0)
			$aInfo = _GDIPlus_GraphicsMeasureString($hContext, $sString2, $hFont, $tLayout, $hFormat)
			_GDIPlus_GraphicsDrawStringEx($hContext, $sString2, $hFont, $aInfo[0], $hFormat, $hBrush)
		Next
	Next
	$tLayout = _GDIPlus_RectFCreate($iOffsetX2, $iOffsetY2, 0, 0)
	$aInfo = _GDIPlus_GraphicsMeasureString($hContext, $sString2, $hFont, $tLayout, $hFormat)
	_GDIPlus_GraphicsDrawStringEx($hContext, $sString2, $hFont, $aInfo[0], $hFormat, $hBrushBlack)
	_GDIPlus_FontDispose($hFont)
	_GDIPlus_FontFamilyDispose($hFamily)
	_GDIPlus_PrivateFontCollectionDispose($hCollection)
	_GDIPlus_StringFormatDispose($hFormat)
	_GDIPlus_BrushDispose($hBrush)
	_GDIPlus_BrushDispose($hBrushBlack)
	_GDIPlus_GraphicsDispose($hContext)
	Return $hBitmap
EndFunc   ;==>_CreateLogoBitmap

Func _CreateBkgBitmap($hGraphics, $iWidth, $iHeight, $iCnt = 2000)
	Local $hBitmap = _GDIPlus_BitmapCreateFromGraphics($iWidth, $iHeight, $hGraphics)
	Local $hContext = _GDIPlus_ImageGetGraphicsContext($hBitmap)
	_GDIPlus_GraphicsClear($hContext, 0xFF000000)
	Local $hBrush[7]
	$hBrush[0] = _GDIPlus_BrushCreateSolid(0xFFFFFFFF)
	$hBrush[1] = _GDIPlus_BrushCreateSolid(0xCCFFFFFF)
	$hBrush[2] = _GDIPlus_BrushCreateSolid(0x99FFFFFF)
	$hBrush[3] = _GDIPlus_BrushCreateSolid(0x66FFFFFF)
	$hBrush[4] = _GDIPlus_BrushCreateSolid(0x33FFFFFF)
	$hBrush[5] = _GDIPlus_BrushCreateSolid(0xBBFFFFFF);0x66FF8888)
	$hBrush[6] = _GDIPlus_BrushCreateSolid(0x22FFFFFF);0x668888FF)
	Local $iSize
	For $i = 0 To $iCnt
		$iSize = Random(1, 3, 1)
		_GDIPlus_GraphicsFillEllipse($hContext, Random(0, $iWidth, 1), Random(0, $iHeight, 1), $iSize, $iSize, $hBrush[Random(0, 6, 1)])
	Next
	For $i = 0 To 6
		_GDIPlus_BrushDispose($hBrush[$i])
	Next
	_GDIPlus_GraphicsDispose($hContext)
	Return $hBitmap
EndFunc   ;==>_CreateBkgBitmap

Func _ExitCredits()
	;_SoundStop($hSound)
	;_SoundClose($hSound)
	_GDIPlus_BrushDispose($hBrushEnd)
	_GDIPlus_BrushDispose($hBrushText)
	_GDIPlus_BrushDispose($hBrushWhite)
	_GDIPlus_BrushDispose($hBrushStar)
	_GDIPlus_PathDispose($hTextPath)
	_GDIPlus_PathDispose($hEndPath)
	_GDIPlus_FontFamilyDispose($hFamily)
	_GDIPlus_PrivateFontCollectionDispose($hCollection)
	_GDIPlus_StringFormatDispose($hFormat)
	_GDIPlus_BitmapDispose($hBitmapBkg)
	_GDIPlus_BitmapDispose($hBitmapFar)
	_GDIPlus_BitmapDispose($hBitmapLogo)
	_GDIPlus_GraphicsDispose($hContext)
	_GDIPlus_BitmapDispose($hBitmap)
	_GDIPlus_GraphicsDispose($hGraphics)
	GUIDelete($hGui)
	_DisableResizing()
	$StopCreditsShow = True
EndFunc   ;==>_Exit

; #FUNCTION# ===================================================================================================
; Name...........: _GDIPlus_GraphicsDrawImageRectRectTrans
; Description ...: Draw an Image object with transparency
; Syntax.........: _GDIPlus_GraphicsDrawImageRectRect($hGraphics, $hImage, $iSrcX, $iSrcY, [$iSrcWidth, _
;                                   [$iSrcHeight, [$iDstX, [$iDstY, [$iDstWidth, [$iDstHeight[, [$iUnit = 2]]]]]]])
; Parameters ....: $hGraphics   - Handle to a Graphics object
;                  $hImage      - Handle to an Image object
;                  $iSrcX       - The X coordinate of the upper left corner of the source image
;                  $iSrcY       - The Y coordinate of the upper left corner of the source image
;                  $iSrcWidth   - Width of the source image
;                  $iSrcHeight  - Height of the source image
;                  $iDstX       - The X coordinate of the upper left corner of the destination image
;                  $iDstY       - The Y coordinate of the upper left corner of the destination image
;                  $iDstWidth   - Width of the destination image
;                  $iDstHeight  - Height of the destination image
;                  $iUnit       - Specifies the unit of measure for the image
;                  $nTrans      - Value range from 0 (Zero for invisible) to 1.0 (fully opaque)
; Return values .: Success      - True
;                  Failure      - False
; Author ........: Siao
; Modified.......: Malkey
; Remarks .......:
; Related .......:
; Link ..........; http://www.autoitscript.com/forum/index.php?s=&showtopic=70573&view=findpost&p=517195
; Example .......; Yes
Func _GDIPlus_GraphicsDrawImageRectRectTrans($hGraphics, $hImage, $iSrcX, $iSrcY, $iSrcWidth = "", $iSrcHeight = "", _
		$iDstX = "", $iDstY = "", $iDstWidth = "", $iDstHeight = "", $iUnit = 2, $nTrans = 1)
	Local $tColorMatrix, $hImgAttrib, $iW = _GDIPlus_ImageGetWidth($hImage), $iH = _GDIPlus_ImageGetHeight($hImage)
	If $iSrcWidth = 0 Or $iSrcWidth = "" Then $iSrcWidth = $iW
	If $iSrcHeight = 0 Or $iSrcHeight = "" Then $iSrcHeight = $iH
	If $iDstX = "" Then $iDstX = $iSrcX
	If $iDstY = "" Then $iDstY = $iSrcY
	If $iDstWidth = "" Then $iDstWidth = $iSrcWidth
	If $iDstHeight = "" Then $iDstHeight = $iSrcHeight
	If $iUnit = "" Then $iUnit = 2
	;;create color matrix data
	$tColorMatrix = DllStructCreate("float[5];float[5];float[5];float[5];float[5]")
	;blending values:
	DllStructSetData($tColorMatrix, 1, 1, 1)
	DllStructSetData($tColorMatrix, 2, 1, 2)
	DllStructSetData($tColorMatrix, 3, 1, 3)
	DllStructSetData($tColorMatrix, 4, $nTrans, 4)
	DllStructSetData($tColorMatrix, 5, 1, 5)
	;;create an image attributes object and update its color matrix
	$hImgAttrib = DllCall($ghGDIPDll, "int", "GdipCreateImageAttributes", "ptr*", 0)
	$hImgAttrib = $hImgAttrib[1]
	DllCall($ghGDIPDll, "int", "GdipSetImageAttributesColorMatrix", "ptr", $hImgAttrib, "int", 1, _
			"int", 1, "ptr", DllStructGetPtr($tColorMatrix), "ptr", 0, "int", 0)
	;;draw image into graphic object with alpha blend
	DllCall($ghGDIPDll, "int", "GdipDrawImageRectRectI", "hwnd", $hGraphics, "hwnd", $hImage, "int", $iDstX, "int", _
			$iDstY, "int", $iDstWidth, "int", $iDstHeight, "int", $iSrcX, "int", $iSrcY, "int", $iSrcWidth, "int", _
			$iSrcHeight, "int", $iUnit, "ptr", $hImgAttrib, "int", 0, "int", 0)
	;;clean up
	DllCall($ghGDIPDll, "int", "GdipDisposeImageAttributes", "ptr", $hImgAttrib)
	Return
EndFunc   ;==>_GDIPlus_GraphicsDrawImageRectRectTrans

; #FUNCTION# ====================================================================================================================
; Name...........: _GDIPlus_CreateFontFamilyFromName
; Description ...: Creates a FontFamily object based on a specified font family.
; Syntax.........: _GDIPlus_CreateFontFamilyFromName($sFontname, $hCollection)
; Parameters ....: $sFontname     - [in] Name of the font family. For example, Arial.ttf is the name of the Arial font family.
;                  $$hCollection  - [in] Pointer to a FontCollection object that specifies the collection that the font family
;                                        belongs to. If FontCollection is NULL, this font family is not part of a collection.
;                                        The default value is NULL.
; Return values .: Success      - a pointer to the new FontFamily object.
;                  Failure      - 0
; Author ........: Prog@ndy, Yashied
; Modified.......:
; Remarks .......:
; Related .......:
; Link ..........; @@MsdnLink@@ GdipCreateFontFamilyFromName
; Example .......;
; ===============================================================================================================================
Func _GDIPlus_CreateFontFamilyFromName($sFontname, $hCollection = 0)
	Local $aResult = DllCall($ghGDIPDll, 'int', 'GdipCreateFontFamilyFromName', 'wstr', $sFontname, 'ptr', $hCollection, 'ptr*', 0)
	If @error Then Return SetError(1, 0, 0)
	Return SetError($aResult[0], 0, $aResult[3])
EndFunc   ;==>_GDIPlus_CreateFontFamilyFromName

; #FUNCTION# ====================================================================================================================
; Name...........: _GDIPlus_PrivateFontCollectionDispose
; Description ...: Releases a PrivateFontCollection object
; Syntax.........: _GDIPlus_PrivateFontCollectionDispose($hFontCollection)
; Parameters ....: $hFontCollection - Pointer to a PrivateFontCollection object
; Return values .: Success      - True
;                  Failure      - False and either:
;                  |@error and @extended are set if DllCall failed
;                  |$GDIP_STATUS contains a non zero value specifying the error code
; Remarks .......: None
; Related .......: None
; Link ..........; @@MsdnLink@@ GdipDeletePrivateFontCollection
; Example .......; No
; ===============================================================================================================================
Func _GDIPlus_PrivateFontCollectionDispose($hFontCollection)
	Local $aResult = DllCall($ghGDIPDll, "uint", "GdipDeletePrivateFontCollection", "ptr*", $hFontCollection)

	If @error Then Return SetError(@error, @extended, False)
	$GDIP_STATUS = $aResult[0]
	Return $aResult[0] = 0
EndFunc   ;==>_GDIPlus_PrivateFontCollectionDispose

; #FUNCTION# ====================================================================================================================
; Name...........: _GDIPlus_PrivateCollectionAddMemoryFont
; Description ...: Adds a font that is contained in system memory
; Syntax.........: _GDIPlus_PrivateCollectionAddMemoryFont($hFontCollection, $pMemory, $iLength)
; Parameters ....: $hFontCollection - Pointer to a PrivateFontCollection object
;                  $pMemory			- Pointer to a font that is contained in memory
;                  $iLength			- Number of bytes of data in the font
; Return values .: Success      - True
;                  Failure      - False and either:
;                  |@error and @extended are set if DllCall failed
;                  |$GDIP_STATUS contains a non zero value specifying the error code
; Remarks .......: None
; Related .......: None
; Link ..........; @@MsdnLink@@ GdipPrivateAddMemoryFont
; Example .......; No
; ===============================================================================================================================
Func _GDIPlus_PrivateCollectionAddMemoryFont($hFontCollection, $pMemory, $iLength)
	Local $aResult = DllCall($ghGDIPDll, "uint", "GdipPrivateAddMemoryFont", "hwnd", $hFontCollection, "ptr", $pMemory, "int", $iLength)

	If @error Then Return SetError(@error, @extended, False)
	$GDIP_STATUS = $aResult[0]
	Return $aResult[0] = 0
EndFunc   ;==>_GDIPlus_PrivateCollectionAddMemoryFont

; #FUNCTION# ====================================================================================================================
; Name...........: _GDIPlus_PrivateCollectionCreate
; Description ...: Creates a PrivateFontCollection object
; Syntax.........: _GDIPlus_PrivateCollectionCreate()
; Parameters ....: None
; Return values .: Success      - Handle to a new PrivateFontCollection object
;                  Failure      - 0 and either:
;                  |@error and @extended are set if DllCall failed
;                  |$GDIP_STATUS contains a non zero value specifying the error code
; Remarks .......: FontFamily objects belong to the collection, they should not be destroyed.
;                  After you are done with the object, call _GDIPlus_PrivateFontCollectionDispose to release the object resources
; Related .......: _GDIPlus_PrivateFontCollectionDispose
; Link ..........; @@MsdnLink@@ GdipNewPrivateFontCollection
; Example .......; No
; ===============================================================================================================================
Func _GDIPlus_PrivateCollectionCreate()
	Local $aResult = DllCall($ghGDIPDll, "uint", "GdipNewPrivateFontCollection", "ptr*", 0)

	If @error Then Return SetError(@error, @extended, 0)
	$GDIP_STATUS = $aResult[0]
	Return $aResult[1]
EndFunc   ;==>_GDIPlus_PrivateCollectionCreate

#EndRegion - Credits -