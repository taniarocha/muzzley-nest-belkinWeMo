#Nest & Belkin WeMo Interface

The Nest & Belkin WeMo allows you to control the Belkin WeMo Switch and the Nest thermostat on the same interface.

The Belkin integration was based on a [github](https://github.com/) project developed in node [muzzley-BelkinWeMo](https://github.com/djsb/muzzley-BelkinWeMo). To integrate with Belkin all i needed was a lamp, the Belkin and the code of [muzzley-BelkinWeMo](https://github.com/djsb/muzzley-BelkinWeMo).
<br><br>
To integrate with Nest there are no official api, but on github exists a unofficial api in node: [unofficial-nodejs-nest](https://github.com/wiredprairie/unofficial_nodejs_nest), which is very simple to use. After that you have to install and configure the Nest. In my case there was no possibility of doing the installation with the thermostat, but I could see the changes in the Nest display. Turn on your Nest and configure the settings, location, wi-fi, etc. Go to [home.nest.com](https://home.nest.com/) to configure you account and set on account setting of your Nest.
<br>After the Nest and Belkin turned on and connected to wi-fi, you are ready to clone the code of this project. 

### WIDGET 
The code of widget folder is the same that is on [muzzley site](http://www.muzzley.com/), you can modify this code and do your own widget.
Pay attention on the muzzley events on the Javascript file. These events will receive and send messages to muzzley.


<pre><code>
	// loads initial values from Nest and Belkin
	muzzley.on('nest_belkin_status', function(data, callback){
		// data.nestTemperatureType	
		// data.nestTemperature
		// data.nestHumidity	
		// data.nestOnline	
		// data.nestAway	
		// data.nestOff	
		// data.belkinMode	
		// data.belkinId
		// data.nestId	
	});
	
	// change the temperature value to 20
	muzzley.send("nest_setTemperature", {newTemperatureValue: 20} );
	
	// change the away status to true
	muzzley.send("nest_setAway", {value: true} );

</code></pre>

On the interface connected with the activity, the clickable areas are the lamp and the nest, that shows you the info of devices and allows you to control them.


###APLICATION
Installing packages:
	<pre><code>npm install</code></pre>

On your shell:
 	<pre><code>node muzzley-nest-belkin.js</code></pre>
 

If all goes well Belkin and Nest devices is detected and the muzzley activity is created. 
Use your muzzley application and insert the activity id to connect and view your interface.


<br><br>

> Belkin WeMo integration credits to Domingos Bruges ([muzzley-BelkinWeMo](https://github.com/djsb/muzzley-BelkinWeMo))


> Nest api credits to project ([ unofficial-nodejs-nest](https://github.com/wiredprairie/unofficial_nodejs_nest))





