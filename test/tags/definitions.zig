/// Type docs.
const TypeName = struct {
    //    ^ definition.class
    /// Field docs.
    field: OtherType,
    //  ^ definition.field
    //         ^ reference.class

    /// Method docs.
    fn method(
        //     ^ definition.method
        /// Parameter docs.
        self: TypeName,
        //      ^ definition.parameter
        //            ^ reference.class
    ) void {
        other.call(self.field);
        //            ^ reference.call
        //                 ^ reference.class
        //                      ^ reference.field
    }
};

const ErrorSet = error{Oops};
//    ^ definition.class

fn top(param: TypeName) void {
    // ^ definition.function
    //     ^ definition.parameter
    //            ^ reference.class
    const local: OtherType = OtherType{ .field = param.field };
    //        ^ definition.variable
    //               ^ reference.class
    //                           ^ reference.class
    //                                         ^ reference.field
    //                                                ^ reference.class
    //                                                       ^ reference.field
    _ = @sizeOf(TypeName);
    //      ^ reference.call

    label: {
        // <- definition.label
        break :label;
        //         ^ reference.label
    }
}
