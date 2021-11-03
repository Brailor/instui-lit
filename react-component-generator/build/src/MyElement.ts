
    import React from 'react';
    import {createComponent} from '@lit-labs/react';
    import {MyElement as MyElementComponent } from 'instui-lit/dist/components/my-element';

    export const MyElement = createComponent(
        React,
        "my-element",
        MyElementComponent,
        {"onCountChanged":"count-changed"}
        );