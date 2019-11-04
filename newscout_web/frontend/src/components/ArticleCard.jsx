import React from 'react';

import { Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, InputGroup, InputGroupAddon, InputGroupText, Input } from 'reactstrap';

class ArticleCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          selected: false
        };
      }

    truncateText = (someThing, blurbMaxChar=250) => {
        if(someThing.length < blurbMaxChar){
            return someThing
        }
        return someThing.substring(0, blurbMaxChar) + "...";
    }

    toggleSelection = () => {
        if(this.state.selected){
            this.setState({ selected: false });
            this.props.toggleHandler(this.props.item.id,'deleted');
        }else{
            this.setState({ selected: true });
            this.props.toggleHandler(this.props.item.id , 'selected');
        }
    }

    loadDetails = () => {
        window.open(this.props.item.source_url, '_blank');
    }

    render(){
        return(
            <div className="col-md-3">
                <Card body color={this.state.selected? "success": ""}>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                                <Input addon type="checkbox" aria-label="Checkbox for following text input" onClick={this.toggleSelection}/>
                            </InputGroupText>
                        </InputGroupAddon>
                        <Input placeholder={this.state.selected? "Selected": "Select"} />
                    </InputGroup><br/>
                    <CardImg top width="100%" src={this.props.item.cover_image ? + this.props.item.cover_image: "/static/images/category/default/asia/01.jpg"} alt="Card image cap" />
                    <CardBody className="text-center">
                        <CardTitle><b>{this.truncateText(this.props.item.title, 100)}</b></CardTitle>
                        <CardSubtitle>via {this.props.item.source}</CardSubtitle>
                        <CardText>{this.truncateText(this.props.item.blurb)}</CardText>
                        <Button onClick={() => this.loadDetails()}>Details</Button>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default ArticleCard;