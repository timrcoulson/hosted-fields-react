import React, {Component, PropTypes} from "react";
import braintree from "braintree-web";
import ExecutionEnvironment from "exenv";

export default class HostedField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            hostedFieldsInstance: null
        };

        this._braintreeInstance = props._braintreeInstance || braintree;

        props.fetchToken().then(this.setupFields.bind(this));

        this.onSubmit = this.onSubmit.bind(this);
    }

    static propTypes = {
        /**
         * Function that fetches a token from the server
         */
        fetchToken: PropTypes.func.isRequired,

        /**
         * On submission of the payment form, this function is called with the tokenized card details
         */
        onTokenization: PropTypes.func.isRequired,

        /**
         * Children of the hosted fields, if more fields are desired
         */
        children: PropTypes.object,

        /**
         * Mock of Braintree used for testing
         */
        _braintreeInstance: PropTypes.object
    };

    onSubmit(event) {
        event.preventDefault();
        this.state.hostedFieldsInstance.tokenize((tokenizeErr, payload) => {
            if (tokenizeErr) {
                console.error(tokenizeErr);
            }
            this.props.onTokenization(payload);
        });
    }

    setupFields(authorisation) {
        if (ExecutionEnvironment.canUseDOM) {
            this._braintreeInstance.client.create({
                authorization: authorisation
            }, (clientErr, clientInstance) => {
                if (clientErr) {
                    console.error(clientErr);
                    return;
                }

                this._braintreeInstance.hostedFields.create({
                    client: clientInstance,
                    styles: {},
                    fields: {
                        number: {
                            selector: "#bt-hosted-fields-card-number",
                            placeholder: "4111 1111 1111 1111"
                        },
                        cvv: {
                            selector: "#bt-hosted-fields-cvv",
                            placeholder: "123"
                        },
                        expirationDate: {
                            selector: "#bt-hosted-fields-expiration-date",
                            placeholder: "10/2019"
                        }
                    }
                }, (hostedFieldsErr, hostedFieldsInstance) => {
                    if (hostedFieldsErr) {
                        console.error(hostedFieldsErr);
                        return;
                    }

                    this.setState({
                        loading: false,
                        hostedFieldsInstance
                    });
                });
            });
        }
    }

    render() {
        const {loading = true} = this.state;
        return (
            <div>
                {loading && <div>Loading...</div>}
                <div style={{display: loading ? "none" : "block"}}>
                    <form method="post" onSubmit={this.onSubmit}>
                        <label htmlFor="bt-hosted-fields-card-number">Card Number</label>
                        <div id="bt-hosted-fields-card-number" />

                        <label htmlFor="bt-hosted-fields-cvv">CVV</label>
                        <div id="bt-hosted-fields-cvv" />

                        <label htmlFor="bt-hosted-fields-expiration-date">Expiration Date</label>
                        <div id="bt-hosted-fields-expiration-date" />

                        {this.props.children}

                        <input type="submit" value="Pay" />
                    </form>
                </div>
            </div>
        );
    }
}
