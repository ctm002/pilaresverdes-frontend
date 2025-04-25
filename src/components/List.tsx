import { useState } from "react";


type Props = {
    data: string[];
    onSelect?: (e: string) => void;
}

const List = ({ data, onSelect}: Props) => {
    
    
    //let index: number = 1;
    const [index, setIndex] = useState(1);

    const handlerClick = (i : number, element: string) => {
        setIndex(i)
        onSelect?.(element);
    }

  return (
    <ul className="list-group">
        {data.map( (element, i) => 
            (<li onClick={() => handlerClick(i, element)} key={i} className={`list-group-item ${i == index ? "active" : ""}`}>{element}</li>)
        )}
    </ul>
    )
}

export default List