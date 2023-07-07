const Product = require('./product-model')

class Cart{
    constructor(items = [],totalquantity = 0,totalprice= 0){
        this.items = items
        this.totalquantity = totalquantity
        this.totalprice = totalprice
    }
    async updatePrices() {
        const productIds = this.items.map(function (item) {
          return item.product.id;
        });
    
        const products = await Product.findMultiple(productIds);
    
        const deletableCartItemProductIds = [];
    
        for (const cartItem of this.items) {
          const product = products.find(function (prod) {
            return prod.id === cartItem.product.id;
          });
    
          if (!product) {
            // product was deleted!
            // "schedule" for removal from cart
            deletableCartItemProductIds.push(cartItem.product.id);
            continue;
          }
    
          // product was not deleted
          // set product data and total price to latest price from database
          cartItem.product = product;
          cartItem.totalPrice = cartItem.quantity * cartItem.product.price;
        }
    
        if (deletableCartItemProductIds.length > 0) {
          this.items = this.items.filter(function (item) {
            return deletableCartItemProductIds.indexOf(item.product.id) < 0;
          });
        }
    
        // re-calculate cart totals
        this.totalQuantity = 0;
        this.totalPrice = 0;
    
        for (const item of this.items) {
          this.totalQuantity = this.totalQuantity + item.quantity;
          this.totalPrice = this.totalPrice + item.totalPrice;
        }
      }
    

    addItem(product){
        const cartitem= {
            product:product,
            quantity:1,
            totalprice:product.price 
        }
        for (let i=0; i<this.items.length;i++){
            const item = this.items[i]
            if(item.product.id ===  product.id){
                cartitem.quantity = +item.quantity + 1
                cartitem.totalprice = item.totalprice + product.price
                this.items[i] = cartitem

                this.totalquantity ++
                this.totalprice += product.price
                return 
            }
        }
        this.items.push(cartitem)// appends product to items array if its not already there
        this.totalquantity += 1
        this.totalprice += product.price
    }
    updateitem(productId,newQuantity){
        for (let i=0; i<this.items.length;i++){
            const item = this.items[i]
            if(item.product.id ===  productId && newQuantity >0){
                const CartItem  = {...item}
                const quantitychange = newQuantity-item.quantity
                CartItem.quantity = newQuantity
                CartItem.totalprice = newQuantity*item.product.price
                this.items[i] = CartItem

                this.totalquantity += quantitychange
                this.totalprice +=quantitychange*item.product.price
                return {updateditemprice:CartItem.totalprice}
            }else if(item.product.id ===  productId && newQuantity <=0) {
                this.items.splice(i,1) // remove one ite starting from the specified index 
                this.totalquantity -= item.quantity
                this.totalprice -= item.totalprice
                return {updateditemprice:0}
            }
        }
    
    }
}
module.exports= Cart