export interface Producto{
    id:number;
    title:string;
    description:string;
    category:string;
    price:number;
    image:string;
    created_at: Date;
    rating:{
        count:number;
        rate:number;
    };
}