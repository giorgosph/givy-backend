const menuItems = (newItem, currItem) => {
    if(!(newItem.id === currItem.id)) return false
    if(!(newItem.menuId === currItem.menuId)) return false
    if(!(newItem.category === currItem.category)) return false
    if(!(newItem.name === currItem.name)) return false
    if(!(newItem.price === currItem.price)) return false
    if(!(newItem.description === currItem.description)) return false
    if(!(newItem.stock === currItem.stock)) return false
    if(!(newItem.sides === currItem.sides)) return false
    if(!(newItem.image === currItem.image)) return false
    return true
}

module.exports = {
  menuItems
}