import React from "react";
import { List, Datagrid, TextField, EditButton, ShowButton } from "react-admin";
import { Settings } from "@mui/icons-material";

const ConfigurationList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="setting_key" />
      <TextField source="setting_value" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const ConfigurationResource = {
  list: ConfigurationList,
  icon: Settings,
};
