import React from 'react';
import { ListItem, ListItemIcon, ListItemText, ListSubheader }from '@material-ui/core';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}
var clickedDashboardList = "";

export const mainListItems = (
  <div>
    {/* <ListItem 
      button
      onClick={() => { clickedDashboardList = "dashboard" }}> */}
    <ListItemLink href="/tornjak/dashboard">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemLink>
    {/* </ListItem> */}
    <ListSubheader inset>Details</ListSubheader>
    <ListItem 
      button
      onClick={() => { clickedDashboardList = "clusters" }}>
      <ListItemIcon>
         <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Clusters" />
    </ListItem>
    <ListItem 
      button
      onClick={() => { clickedDashboardList = "agents" }}>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Agents" />
    </ListItem>
    <ListItem 
      button
      onClick={() => { clickedDashboardList = "entries" }}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Entries" />
    </ListItem>
  </div>
);