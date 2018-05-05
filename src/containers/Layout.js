import React from 'react';
import './Layout.css';

import Viz from '../components/Viz'

const Layout = (props) => {

    return (
        <div>
            {props.children}
            <Viz/>
            </div>
    );


}

export default Layout;