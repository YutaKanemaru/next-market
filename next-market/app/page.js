import Link from "next/link";
import Image from "next/image";

const getAllItems = async () => {
    const response = await fetch("http://localhost:3000/api/item/readall", { cache: "no-store" });
    const jsonData = await response.json();
    const allItems = jsonData.allItems;
    return allItems;
    }

const ReadAllItems = async() => {
    const allItems = await getAllItems();
    console.log(allItems);
    return (
        <div>
            <h1>All Items</h1>
            {allItems.map((item) => (
                <Link key={item._id} href={`/item/readsingle/${item._id}`}>
                    <Image src={item.image} alt="item-image" width={750} height={500} />
                    <div>
                        <h2>{item.price}</h2>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                </Link>
            ))}   
        </div>
    );
}

export default ReadAllItems;