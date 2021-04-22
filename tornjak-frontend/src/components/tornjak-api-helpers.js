import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import {
  serverSelected,
  serverInfoUpdate,
  tornjakServerInfoUpdate,
  tornjakMessege,
} from 'actions';

class TornjakApi extends Component {
}

function populateTornjakServerInfo(serverName, props) {
  axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
    .then(response => {
      props.tornjakServerInfoUpdate(response.data["serverinfo"]);
      props.tornjakMessege(response.statusText);
    }).catch(error => {
      props.tornjakMessege("Error retrieving " + serverName + " : " + error.message);
      props.tornjakServerInfoUpdate([]);
    });
}

function populateLocalTornjakServerInfo(props) {
  axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
    .then(response => {
      props.tornjakServerInfoUpdate(response.data["serverinfo"]);
      props.tornjakMessege(response.statusText);
    })
    .catch((error) => {
      console.log(error);
      props.tornjakMessege("Error retrieving " + " : " + error.message);
    })
}

function populateServerInfo(props) {
  //node attestor plugin
  const nodeAttKeyWord = "NodeAttestor Plugin: ";
  if (props.globalTornjakServerInfo === "" || props.globalTornjakServerInfo.length === 0)
    return
  var serverInfo = props.globalTornjakServerInfo;
  var nodeAttStrtInd = serverInfo.search(nodeAttKeyWord) + nodeAttKeyWord.length;
  var nodeAttEndInd = serverInfo.indexOf('\n', nodeAttStrtInd)
  var nodeAtt = serverInfo.substr(nodeAttStrtInd, nodeAttEndInd - nodeAttStrtInd)
  //server trust domain
  const trustDomainKeyWord = "\"TrustDomain\": \"";
  var trustDomainStrtInd = serverInfo.search(trustDomainKeyWord) + trustDomainKeyWord.length;
  var trustDomainEndInd = serverInfo.indexOf("\"", trustDomainStrtInd)
  var trustDomain = serverInfo.substr(trustDomainStrtInd, trustDomainEndInd - trustDomainStrtInd)
  var reqInfo =
  {
    "data":
    {
      "trustDomain": trustDomain,
      "nodeAttestorPlugin": nodeAtt
    }
  }
  props.serverInfoUpdate(reqInfo);
}

function populateAgentsUpdate(serverName, props) {
  axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
    .then(response => {
      props.agentsListUpdate(response.data["agents"]);
      props.tornjakMessege(response.statusText);
    }).catch(error => {
      props.tornjakMessege("Error retrieving " + serverName + " : " + error.message);
      props.agentsListUpdate([]);
    });

}

function populateLocalAgentsUpdate(props) {
  axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
    .then(response => {
      props.agentsListUpdate(response.data["agents"]);
      props.tornjakMessege(response.statusText);
    })
    .catch((error) => {
      console.log(error);
      props.tornjakMessege("Error retrieving " + " : " + error.message);
    })
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export {
  populateServerInfo,
  populateTornjakServerInfo,
  populateLocalTornjakServerInfo,
  populateAgentsUpdate,
  populateLocalAgentsUpdate,
};
export default connect(
  mapStateToProps,
  { serverSelected, tornjakServerInfoUpdate, serverInfoUpdate, tornjakMessege }
)(TornjakApi)