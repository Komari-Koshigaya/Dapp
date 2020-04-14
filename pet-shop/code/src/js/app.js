App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    console.log("load pets\n")
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });
    // $(document).on('click', '.btn-adopt', App.handleAdopt);

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        // await window.ethereum.enable();//该方法被抛弃
        await window.ethereum.send();//ethereum.enable()被弃用，改成ethereum.send();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
	// 加载Adoption.json，保存了Adoption的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
	$.getJSON('Adoption.json', function(data) {
		// 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
		var AdoptionArtifact = data;
		App.contracts.Adoption = TruffleContract(AdoptionArtifact);

		// Set the provider for our contract
		App.contracts.Adoption.setProvider(App.web3Provider);

		// Use our contract to retrieve and mark the adopted pets
		return App.markAdopted();
	});
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
	var adoptionInstance;

	App.contracts.Adoption.deployed().then(function(instance) {
	  adoptionInstance = instance;

	  // 调用合约的getAdopters(), 用call读取信息不用消耗gas
	  return adoptionInstance.getAdopters.call();
	}).then(function(adopters) {
	  console.log("尝试禁用领养按钮");
	  for (i = 0; i < adopters.length; i++) {
	    if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
	      $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
	    }
	  }
	}).catch(function(err) {
	  console.log(err.message);
	});
  },

  handleAdopt: function(event) {
    event.preventDefault();//禁止触发默认操作，如果有的话

    var petId = parseInt($(event.target).data('id'));
	var adoptionInstance;

    // 获取用户账号
    console.log("有客户想领养宠物 " + petId + " 号");
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // 发送交易领养宠物
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();//成功了就禁用按钮
      }).catch(function(err) {
        console.log("禁用领养按钮失败\n" + err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
