const deleteProduct=async e=>{let r=e.parentNode.querySelector("[name=id]").value,t=e.parentNode.querySelector("[name=_csrf]").value,a=e.closest("article");try{let c=await fetch(`/admin/product/${r}`,{method:"DELETE",headers:{"csrf-token":t}});c&&a.remove()}catch(o){console.error(o)}};