import { findByProps } from "@vendetta/metro";

export const { ScrollView } = findByProps("ScrollView");
export const {
    TableRowGroup,
    TableSwitchRow,
    TableCheckboxRow,
    TableRadioGroup,
    TableRadioRow,
    Stack,
    TableRow,
} = findByProps(
    "TableSwitchRow",
    "TableCheckboxRow",
    "TableRadioGroup",
    "TableRadioRow",
    "TableRowGroup",
    "Stack",
    "TableRow"
);
export const { TextInput } = findByProps("TextInput");
