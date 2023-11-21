import {get} from"@/common/api-service"
export function getById(id) {
    return get('user/' + id);
}
export function getAll(){
    return get('user/fileslist');
}
export function getSellerAllProducts(seller){
    return get('products/company/'+ seller)
}
