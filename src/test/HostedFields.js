/* eslint max-nested-callbacks: [1, 5] */

import React from "react";
import ReactDOM from "react-dom";
import HostedFields from "../HostedFields";
import Promise from "es6-promise";
import {renderIntoDocument} from "react-addons-test-utils";

class MockBraintree {}

describe("HostedFields", () => {
    const fetchToken = () => {
        return new Promise((resolve) => {
            const testClientToken = "SOME_TOKEN";
            resolve(testClientToken);
        });
    };

    const onTokenization = (nonce) => {
        console.log(nonce);
    };

    const renderer = renderIntoDocument(
        <HostedFields
            fetchToken={fetchToken}
            onTokenization={onTokenization}
            _braintreeInstance={new MockBraintree()}
        />
    );
    const dom = ReactDOM.findDOMNode(renderer);

    it("should render correctly", () => {
        return expect(renderer).to.be.ok;
    });

    it("should show loading text", () => {
        const text = dom.getElementsByTagName("div")[0].textContent;
        return expect(text).to.equal("Loading...");
    });
});
