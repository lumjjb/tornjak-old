import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
// Components
import { 
  CssBaseline, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  Container, 
  Grid, Paper } from '@material-ui/core';
  // Icons
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { mainListItems } from './listItems';
// Pie Charts
import AgentsPieChart from './agents-pie-chart';
import ClustersPieChart from './clusters-pie-chart';
// Tables
import ClustersTable from './clusters-dashboard-table';
import AgentsTable from './agents-dashboard-table';
import EntriesTable from './entries-dashboard-table';

const drawerWidth = 240;
const drawerHeight = 840;

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: -41,
    marginLeft: -20,
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: { //drawer icon close
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: { //appbar
    backgroundColor: 'grey',
    //color: 'black',
    marginTop: 70,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: { //appbar on shift/ open
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: { //menu button next to Tornjak Dashboard title on view
    marginRight: 35,
  },
  menuButtonHidden: { //menu button next to Tornjak Dashboard title on hidden
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: { //dashboard side drawer on open
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    height: drawerHeight,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: { //dashboard side drawer on close
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    // overflow: 'auto',
  },
  container: { //container for root
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: { //container for all grids
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    marginBottom: 20
  },
  fixedHeight: {
    height: 370, //height of piechart container
  },
}));

export default function TornjakDashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Tornjak Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>{mainListItems}</List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Pie Chart Clusters */}
            <Grid item xs={6}>
              <Paper className={fixedHeightPaper}>
                <ClustersPieChart />
              </Paper>
            </Grid>
            {/* Pie Chart Agents*/}
            <Grid item xs={6}>
              <Paper className={fixedHeightPaper}>
                <AgentsPieChart />
              </Paper>
            </Grid>
            {/* Clusters Table */}
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <ClustersTable />
              </Paper>
            </Grid>
            {/* Agents Table */}
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <AgentsTable />
              </Paper>
            </Grid>
            {/* Entries Table */}
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <EntriesTable />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
