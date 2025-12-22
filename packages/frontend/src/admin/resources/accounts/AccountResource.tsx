import React from "react";
import { List, Datagrid, TextField, EditButton, ShowButton } from "react-admin";
import { AccountBalance } from "@mui/icons-material";

const AccountList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="account_number" />
      <TextField source="customer_name" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const AccountResource = {
  list: AccountList,
  icon: AccountBalance,
};
