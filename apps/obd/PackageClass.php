<?php
class PackageData {

		var $header;
		var $version; 
		var $dev_id;
		var $length;
		var $commandtype;
		var $param1;
		var $param2; 
		var $param3;
		var $param4; 
		var $param5;
		var $packageType;
		var $crc ;
		var $tail;

   function setHeader($header)
   {
   	 $this->header = $header;
   }
   function getHeader()
   {
   	 return $this->header;
   }
   function setVersion($version)
   {
   	 $this->version = $version;
   }
   function getVersion()
   {
   	 return $this->version;
   }
   function setdevID($dev_id)
   {
   	 $this->dev_id = $dev_id;
   }
   function getdevID()
   {
   	 return $this->dev_id;
   }
   function setLength($length)
   {
   	 $this->length = $length;
   }
   function getLength()
   {
   	 return $this->length;
   }
   function setCommandType($commandtype)
   {
   	 $this->commandtype = $commandtype;
   }
   function getCommandType()
   {
   	 return $this->commandtype;
   }
   function setparam1($param1)
   {
   	 $this->param1 = $param1;
   }
   function getparam1()
   {
   	 return $this->param1;
   }
   function setparam2($param2)
   {
   	 $this->param2 = $param2;
   }
   function getparam2()
   {
   	 return $this->param2;
   }
   function setparam3($param3)
   {
   	 $this->param3 = $param3;
   }
   function getparam3()
   {
   	 return $this->param3;
   }
   function setparam4($param4)
   {
   	 $this->param4 = $param4;
   }
   function getparam4()
   {
   	 return $this->param4;
   }
   function setparam5($param5)
   {
   	 $this->param5 = $param5;
   }
   function getparam5()
   {
   	 return $this->param5;
   }
   function setpackageType($packageType)
   {
   	 $this->packageType = $packageType;
   }
   function getpackageType()
   {
   	 return $this->packageType;
   }
   function setCRC($crc)
   {
   	 $this->crc = $crc;
   }
   function getCRC()
   {
   	 return $this->crc;
   }
   function setTail($tail)
   {
   	 $this->tail = $tail;
   }
   function gettail()
   {
   	 return $this->tail;
   }
}
?>