import React from 'react';
import { Panel } from 'react-bootstrap';
const ResponseMessage = (props) => {
    
    return props.responses.map((item, index) => (
        <Panel bsStyle={item.style} key={index} >
            <Panel.Heading>
                <Panel.Title>{item.title}</Panel.Title>
            </Panel.Heading>
            <Panel.Body>{item.content}</Panel.Body>
        </Panel>   
    ));

}

export default ResponseMessage