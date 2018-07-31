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

| Property | Type | Default | Description |
| :------| :------| :------| :------ |
| width | Number | 200 | field Width |
| height | Number | 25 | field Height |
| resultHeight | Number | 140 | height of result box |
| wrapCls | String | '' | wrapper's Class |
| placeholder | String | '' | field's empty text |
| msec | Number | 500 | animination delay |
| repeatable | Boolean | false | whether value can be duplicate |
| enableEmpty | Boolean | false | whether field's value can be empty |
| require | Boolean | true | whether there must be at least one field |
| autoComplete | Function | null | auto-complete the field @param : original value @return completed value |
| validator | Function | null | custom validator @param : value @return {valid : true/false, msg : 'message'} |



## Functions

1. GET
```
$('#el').multifield('getValue');
```

2. SET
```
var data = ['1.1.1.1', '2.2.2.2'];
$('#el').multifield('setValue', data);
```

3. CLEAR
```
$('#el').multifield('clear');
```

4. VALIDATION
```
$('#el').multifield('isValid');
```