import { Component } from 'react';

class TornjakHelper extends Component {
    detailsLink(selectedRows, title, ) {
        const dashboardDetailsLink = "/tornjak/dashboard/details/";
        if (selectedRows.length !== 0) {
          var detailsLink = dashboardDetailsLink + title.toLowerCase() + "/" + selectedRows[0].name;
        }
        return detailsLink;
      }

}
  export default TornjakHelper;