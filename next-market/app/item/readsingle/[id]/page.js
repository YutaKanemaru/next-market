import Image from "next/image";

const getSingleImage = async (id) => {
    const response = await fetch(`http://localhost:3000/api/item/readsingle/${id}`, { cache: "no-store" });
    const jsonData = await response.json();
    const singleItem = jsonData.singleItem;
    return singleItem;
}

const ReadSingleItem = async ({ params }) => {
    const { id } = await params;
    const singleItem = await getSingleImage(id);
    console.log(singleItem);
    return (
        <div>
            <Image src={singleItem.image} alt="item-image" width={750} height={500} />
            <div>
                <h1>{singleItem.title}</h1>
                <h2>{singleItem.price}</h2>
                <p>{singleItem.description}</p>
            </div>
        </div>
    );
}

export default ReadSingleItem;