import * as React from 'react';

export class Loading extends React.Component<any, any> {
    public render(): JSX.Element {
        const style = { color: 'rgba(22,35,58,0.74)', fontFamily: '\'Segoe UI\', Tahoma, Helvetica, Sans-Serif', fontSize: '1.125rem', lineHeight: '2rem' };

        return (
            <div>
                <span style={style}>We're getting things ready for you, just a moment...</span>
            </div>
        );
    }
}