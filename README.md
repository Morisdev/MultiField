# MultiField
A multiple textfield plugin

## Usage
```
<link rel="stylesheet" href="../src/MultiField.css" />
<script src="jquery.min.js"></script>
<script src="MultiField.js"></script>

$('#el').multifield({
    // config
});
``` 

## Configuration

```
{
    placeholder : 'xxx',
    msec : 500, // animation milliseconds
    limit : 5, // maximum amount of fields
    repeatable : false, // fields's values can be duplicate
    enableEmpty : false, // field value can be empty
    require : true, // there must be at least one field
    validator : ''  // predefined string of regex or a custom valid function
}
```
