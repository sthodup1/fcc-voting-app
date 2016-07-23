'use strict';

(function(){
    var ListGroup = ReactBootstrap.ListGroup;
    var ListGroupItem = ReactBootstrap.ListGroupItem;
    var apiUrl = appUrl + '/api/myCharts';
    
    class WellHolder extends React.Component {
        constructor() {
            super();
            this.state = {
                charts: []
            };
        }
        componentDidMount() {
            ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET',apiUrl, function(data) {
                var ajaxResult = JSON.parse(data);
                if(ajaxResult.result == "noAuth") {
                    window.location = "/";
                } else if(ajaxResult.result == "err") {
                    window.alert("An error occurred. Try again later.")
                } else {
                    this.setState({
                        charts: ajaxResult.data
                    });
                }
            }.bind(this)));
        }
        render() {
            var count = 1;
            var eachChart = this.state.charts.map(function(item) {
                return (
                    <ListGroupItem href={"/chart/" +item["_id"]} key={count++}>{item.title}</ListGroupItem>
                    )
            });
            
            return (
            <ListGroup>
                {eachChart}
            </ListGroup>); 
        }
    }
    
    ReactDOM.render(
        <WellHolder />,
        document.getElementById("listContainer")
    );
    
    
})(); 
