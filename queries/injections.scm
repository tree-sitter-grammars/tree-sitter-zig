((comment) @injection.content
  (#set! injection.language "comment"))

((doc_comment_content) @injection.content
  (#set! injection.language "markdown")
  (#set! injection.combined))

; TODO: add when asm is added
; (asm_output_item (string) @injection.content
;   (#set! injection.language "asm"))
; (asm_input_item (string) @injection.content
;   (#set! injection.language "asm"))
; (asm_clobbers (string) @injection.content
;   (#set! injection.language "asm"))
