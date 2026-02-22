<script>
// required for process php data within javascript
function ap_processFile(){
	let hash = '<?php echo $ap['session']; ?>';
	return 'process.php?hash='+hash+'&';
}









</script>