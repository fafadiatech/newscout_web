import React from 'react';

import {
    Map,layer,Layers
} from "react-openlayers";

function Mapol() {
    return (
        <div className="map-ol">
            <Map view={{center:[0,0],zoom:2}}>
                <Layers>
                    <layer.Tile></layer.Tile>
                </Layers>
            </Map>
        </div>
    )
}


export default Mapol;