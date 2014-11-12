FileToVariable(FileOpenDialog("Select File To Process", "", "All(*.*)"), 0, 0, 120)

Func FileToVariable($File, $2file = 0, $Compress = False, $LineLen = 120)
If $File = "" Then Exit
If Not $2file Then
Local $Variable = StringStripWS(InputBox("Varable Name", "Enter Var Name:", "Bin"), 3)
If $Variable = "" Then Exit
EndIf
Local $Handle = FileOpen($File, 16)
Local $Source = FileRead($Handle)
FileClose($Handle)
If $Compress Then $Source = _LZNTCompress($Source, 258)
If $2file Then
Local $hFile = FileSaveDialog("Select File to save as", "", "ALL(*.*)", 18)
If @error Then Return 1
FileWrite($hFile, Binary($Source))
Return 1
EndIf
Local $StringLen = $LineLen
Local $String = String($Source)
Local $Out = "$" & $Variable & " = '" & StringLeft($String, $StringLen - 2) & "'" & @CRLF
$String = StringTrimLeft($String, $StringLen - 2)
While StringLen($String) > $StringLen
$Out &= "$" & $Variable & " &= '" & StringLeft($String, $StringLen) & "'" & @CRLF
$String = StringTrimLeft($String, $StringLen)
WEnd
If StringLen($String) <> 0 Then $Out &= "$" & $Variable & " &= '" & $String & "'" & @CRLF
ClipPut($Out)
MsgBox(64, "Advisory", "The binary data was placed to clipboard, paste it with [CTRL]+[V]")
Return
EndFunc   ;==>FileToVariable

Func _LZNTCompress($vInput, $iCompressionFormatAndEngine = 2)
If Not $iCompressionFormatAndEngine = 258 Then $iCompressionFormatAndEngine = 2
Local $bBinary = Binary($vInput)

Local $tInput = DllStructCreate("byte[" & BinaryLen($bBinary) & "]")
DllStructSetData($tInput, 1, $bBinary)

Local $a_Call = DllCall("ntdll.dll", "int", "RtlGetCompressionWorkSpaceSize", _
"ushort", $iCompressionFormatAndEngine, _
"dword*", 0, _
"dword*", 0)

If @error Or $a_Call[0] Then
Return SetError(1, 0, "") ; error determining workspace buffer size
EndIf

Local $tWorkSpace = DllStructCreate("byte[" & $a_Call[2] & "]") ; workspace is needed for compression

Local $tBuffer = DllStructCreate("byte[" & 16 * DllStructGetSize($tInput) & "]") ; initially oversizing buffer

$a_Call = DllCall("ntdll.dll", "int", "RtlCompressBuffer", _
"ushort", $iCompressionFormatAndEngine, _
"ptr", DllStructGetPtr($tInput), _
"dword", DllStructGetSize($tInput), _
"ptr", DllStructGetPtr($tBuffer), _
"dword", DllStructGetSize($tBuffer), _
"dword", 4096, _
"dword*", 0, _
"ptr", DllStructGetPtr($tWorkSpace))

If @error Or $a_Call[0] Then
Return SetError(2, 0, "") ; error compressing
EndIf

Local $tOutput = DllStructCreate("byte[" & $a_Call[7] & "]", DllStructGetPtr($tBuffer))

Return SetError(0, 0, DllStructGetData($tOutput, 1))

EndFunc   ;==>_LZNTCompress