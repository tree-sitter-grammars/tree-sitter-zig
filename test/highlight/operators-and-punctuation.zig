fn punctuation(xs: []const i32) void {
//            ^ punctuation.bracket
//                 ^ punctuation.bracket
//                   ^ keyword
//                            ^ punctuation.bracket
    const ptr = &xs[0].*;
//              ^ operator
//                 ^ punctuation.bracket
//                  ^ number
//                   ^ punctuation.bracket
//                    ^ operator
    const maybe = ptr.?;
//                   ^ operator
    const range = xs[0..10];
//                  ^ punctuation.bracket
//                   ^ number
//                    ^ operator
//                      ^ number
//                        ^ punctuation.bracket
    switch (range) {
//  ^ keyword.conditional
//         ^ punctuation.bracket
//               ^ punctuation.bracket
        0 => 1,
//        ^ punctuation.delimiter
//           ^ number
        else => 0,
//      ^ keyword.conditional
    }
}
