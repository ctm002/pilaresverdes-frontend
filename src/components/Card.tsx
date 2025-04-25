import { ReactNode } from "react";

interface Props {
    children: ReactNode
}

function Card (props: Props) {
    const { children } = props;
    return (
        <div className="card text-center" style={ {width: '350px' }}>
            <div className="card-header">
                Featured
            </div>
            <div className="card-body">
                { children }
            </div>
            <div className="card-footer text-body-secondary">
                2 days ago
            </div>
        </div>);
}

interface CardBodyProps {
    title: string;
    text?: string;
}

export function CardBody(props: CardBodyProps) {
    const {title, text} = props;
    return (
        <>
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{text}</p>
        </>
    );
}


export default Card;