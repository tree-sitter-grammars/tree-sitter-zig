;; # Injections
;;
;; I don't think a useful purpose is served by injecting a
;; 'comment' language into comments, so I commented it out.
;;
;; As for the asm injections, I got them to _kind of_ work,
;; but at least in Neovim, the result was not satisfactory,
;; as it lacks the #strip! directive which could remove `\\`
;; from multi-line tokens, and this crashes initialization.
;;
;; So these are included as a sort of head start for others
;; who may want to take this further than I was able.

; ((comment) @injection.content
;   (#set! injection.language "comment"))
;
; (asm_output_item (string
;         (string_content) @injection.content)
;   (#set! injection.language "asm"))
; (asm_input_item (string
;         (string_content) @injection.content)
;   (#set! injection.language "asm"))
; (asm_expression (string
;         (string_content) @injection.content)
;   (#set! injection.language "asm"))
; (asm_output_item (multiline_string
;         (string_content)+ @injection.content)
;   (#set! injection.language "asm")
;   (#set! injection.include_children))
; (asm_input_item (multiline_string
;         (string_content)+ @injection.content)
;   (#set! injection.language "asm")
;   (#set! injection.include_children))
; (asm_expression (multiline_string) @injection.content
;   (#set! injection.language "asm")
;   (#set! injection.include_children))
