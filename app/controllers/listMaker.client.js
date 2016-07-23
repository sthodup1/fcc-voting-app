'use strict';

(function(){
    var ListGroup = ReactBootstrap.ListGroup;
    var ListGroupItem = ReactBootstrap.ListGroupItem;
    var apiUrl = appUrl + '/api/charts';
    
    class WellHolder extends React.Component {
        constructor() {
            super();
            this.state = {
                charts: []
            };
        }
        componentDidMount() {
            ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET',apiUrl, function(data) {
                this.setState({
                    charts: JSON.parse(data)
                })
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
