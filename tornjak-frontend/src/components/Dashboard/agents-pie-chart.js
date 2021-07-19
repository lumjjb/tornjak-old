import React from 'react';
import Title from './title';
import PieChart1 from "charts/PieChart";

const data = [
  {
    "group": "Agent1",
    "value": 20000
  },
  {
    "group": "Agent2",
    "value": 65000
  },
  {
    "group": "Agent3",
    "value": 75000
  },
  {
    "group": "Agent4",
    "value": 1200
  },
  {
    "group": "Agent5",
    "value": 10000
  },
  {
    "group": "Agent6",
    "value": 25000
  },
  {
    "group": "Agent7",
    "value": 20000
  },
  {
    "group": "Agent8",
    "value": 65000
  },
  {
    "group": "Agent9",
    "value": 75000
  },
  {
    "group": "Agent10",
    "value": 1200
  },
  {
    "group": "Agent11",
    "value": 10000
  },
  {
    "group": "Agent12",
    "value": 25000
  }
]

export default function AgentsPieChart() {
  return (
    <React.Fragment>
      <Title># of Entries per Agent</Title>
      <PieChart1
          data={data}
      />
    </React.Fragment>
  );
}
