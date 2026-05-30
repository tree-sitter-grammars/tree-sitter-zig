const cie_ptr_or_id_size: u8 = switch (section) {
    .eh_frame => 4,
    .debug_frame => switch (unit_header.format) {
        .@"32" => 4,
        .@"64" => 8,
    },
};
