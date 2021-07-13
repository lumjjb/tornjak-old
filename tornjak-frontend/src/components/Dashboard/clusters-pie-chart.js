import React from 'react';
import Title from './Title';
import PieChart1 from "charts/PieChart";

const data = [
  {
    "group": "Cluster1",
    "value": 20000
  },
  {
    "group": "Cluster2",
    "value": 65000
  },
  {
    "group": "Cluster3",
    "value": 75000
  },
  {
    "group": "Cluster4",
    "value": 1200
  },
  {
    "group": "Cluster5",
    "value": 10000
  },
  {
    "group": "Cluster6",
    "value": 25000
  }
]
export default function ClustersPieChart() {

  return (
    <React.Fragment>
      <Title># of Agents per Cluster</Title>
        <PieChart1
          data={data}
      />
    </React.Fragment>
  );
}