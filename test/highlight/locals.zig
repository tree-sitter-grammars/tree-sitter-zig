fn local_scope(input: i32) i32 {
// <- keyword.function
// ^ function
//                ^ constant
//                    ^ type.builtin
    const value = input;
//  ^ keyword
//        ^ constant
//                ^ constant
    if (value > 0) |payload| {
//  ^ keyword.conditional
//      ^ constant
//            ^ operator
//              ^ number
//                   ^ constant
        return payload + value;
//      ^ keyword.return
//             ^ constant
//                       ^ constant
    }
    return input;
//  ^ keyword.return
//         ^ constant
}

const TypeName = struct {
//    ^ constant
    field: i32,
//  ^ variable.member
};

const instance = TypeName{ .field = 1 };
//    ^ constant
//               ^ constant
//                          ^ variable.member
