import React from "react";
import jQuery, * as $ from 'jquery/dist/jquery.js';
import ReactSummernote from 'react-summernote';

import 'bootstrap/js/src/modal';
import 'bootstrap/js/src/dropdown';
import 'bootstrap/js/src/tooltip';

class Summernote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ""
        }
    }

    onChange = (content) => {
        this.props.changedValue(content)
    }

    render() {
        var options = {
                    height: 900,
                    width: 850,
                    dialogsInBody: true,
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['font', ['strikethrough', 'superscript', 'subscript']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']],
                        ['table', ['table']],
                        ['insert', ['link', 'picture', 'video']],
                        ['view', ['fullscreen', 'codeview']]
                    ]
                }
            if (this.props.isletter){options.height=500}
        return (
            <ReactSummernote
                value={this.props.value}
                options={options}
                onChange={this.onChange}
            />
        )
    }
}

export default Summernote;