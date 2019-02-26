import * as React from 'react';
import * as ReactDom from 'react-dom';
import { SignInView } from './components/sign-in-view';
import { TabConfigurationView } from './components/tab-configuration-view';
import { WebPartView, WebPartType } from './components/web-part-view';
import { TrainingView } from './components/training-view';
import { Helper } from './infrastructure/helper';

const container = document.getElementById('main');

function renderWebPartView(type: WebPartType) {
    ReactDom.render(
        <WebPartView type={type} />,
        container);
}

export function renderSignInView() {
    ReactDom.render(<SignInView />, container);
}

export function renderTabConfigurationView() {
    ReactDom.render(
        <TabConfigurationView />,
        container
    );
}

export function renderCourseView() {
    renderWebPartView(WebPartType.Course);
}

export function renderCourseCatalogView() {
    renderWebPartView(WebPartType.CourseCatalog);
}

export function renderDashboardView() {
    renderWebPartView(WebPartType.Dashboard);
}

export function renderTrainingView() {
    ReactDom.render(<TrainingView />, container);
}

export function renderSignInCallbackView() {
    Helper.handleAuthenticationCallback();
}