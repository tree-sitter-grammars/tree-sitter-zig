pub export fn add(noalias lhs: i32, comptime rhs: i32) i32 {
// <- keyword.modifier
//  ^ keyword.import
//         ^ keyword.function
//            ^ function
//                ^ keyword.modifier
//                        ^ constant
//                             ^ type.builtin
//                                  ^ keyword.modifier
//                                           ^ constant
//                                                ^ type.builtin
//                                                     ^ type.builtin
    return lhs + rhs;
//  ^ keyword.return
//         ^ constant
//             ^ operator
//               ^ constant
}

const Point = struct {
// <- keyword
//    ^ constant
//          ^ operator
//            ^ keyword.type
    x: i32,
//  ^ variable.member
//     ^ type.builtin
};

pub usingnamespace Mixin;
// <- keyword.modifier
//  ^ keyword.import
//                 ^ constant

test "decls" {}
// <- keyword
//   ^ string
