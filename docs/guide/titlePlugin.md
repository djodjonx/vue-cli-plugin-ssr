# Title plugin

This tiny plugin help you to render dynamically the title of the page, both Client & server.

# Usage

```js
// Vue component file
<script>
  export default {
    name: 'MyComonent',
    props: {
      data: {
        type: array,
        required: true
      }
     },
    title () {
      // Define title dynamically
      return this.firstItem.title
    },
    computed: {
      firstItem () {
        return this.data[0]
      }
    }
  }
</script>
```