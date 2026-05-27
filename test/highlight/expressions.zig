fn calls() void {
    const value = @as(i32, 1);
//  ^ keyword
//        ^ constant
//              ^ operator
//                ^ function.builtin
//                    ^ type.builtin
//                         ^ number
    foo(value);
//  ^ function.call
//      ^ constant
    ns.foo();
//  ^ constant
//    ^ punctuation.delimiter
//     ^ function.call
    const member = point.x;
//        ^ constant
//                 ^ constant
//                       ^ variable.member
    const init = Point{ .x = 1 };
//        ^ constant
//               ^ constant
//                       ^ variable.member
//                         ^ operator
//                           ^ number
}

fn control(flag: bool, items: []const i32) void {
    if (flag) return;
//  ^ keyword.conditional
//      ^ constant
//            ^ keyword.return
    while (next()) break;
//  ^ keyword.repeat
//                 ^ keyword.repeat
    for (items) |item| continue;
//  ^ keyword.repeat
//       ^ constant
//               ^ constant
//                     ^ keyword.repeat
    const picked = flag and true or false;
//                      ^ keyword.operator
//                          ^ boolean
//                               ^ keyword.operator
//                                  ^ boolean
    const recovered = fallible() catch |err| 0;
//                    ^ function.call
//                               ^ keyword.exception
//                                      ^ constant
//                                           ^ number
    const tried = try fallible();
//                ^ keyword.exception
//                    ^ function.call
}
