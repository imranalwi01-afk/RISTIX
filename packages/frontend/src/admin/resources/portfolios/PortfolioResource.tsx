import React from "react";
import { List, Datagrid, TextField, EditButton, ShowButton } from "react-admin";
import { AccountBalance as Portfolio } from "@mui/icons-material";

const PortfolioList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="portfolio_name" />
      <TextField source="total_accounts" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const PortfolioResource = {
  list: PortfolioList,
  icon: Portfolio,
};
