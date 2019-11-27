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

    onImageUpload = (files) => {
        var imageFile = files[0];
        var imageURL = URL.createObjectURL(imageFile);
        ReactSummernote.insertImage(imageURL, $image => {
            $image.css("width", Math.floor($image.width() / 2));
            $image.attr("alt", image.name);
        });
    }

    render() {
        $(".dropdown-toggle").dropdown();
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
                onImageUpload={this.onImageUpload}
            />
        )
    }
}

export default Summernote;