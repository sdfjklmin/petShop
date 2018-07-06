// APP应用
App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // 载入宠物狗数据
    $.getJSON('../pets.json', function(data) {
      //拼接前端页面
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        if(data[i].owner === '') {
          petTemplate.find('.btn-adopt').attr('disabled',false);
          petTemplate.find('.btn-adopt').html('Adopt');
        }else{
           petTemplate.find('.btn-adopt').attr('disabled',true);
           petTemplate.find('.btn-adopt').html('Link Owner');
        }

        petsRow.append(petTemplate.html());
      }
    });
    // 初始化web3  
    return App.initWeb3();
  },

  initWeb3: function() {
    // 给APP web3赋值
    if (typeof web3 !== 'undefined') {
      //调用当前 MetaMask 的钱包数据
      App.web3Provider = web3.currentProvider;
    } else {
      //调用本地钱包地址
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(App.web3Provider);
    // 初始化合同
    return App.initContract();
  },

  initContract: function() {
    // 载入合同ABI
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();
      // 初始化绑定事件
      return App.bindEvents();
    });

  },

  bindEvents: function() {
    // 添加绑定事件和交易处理事件
    $(document).on('click', '.btn-adopt', App.handleAdopt);

  },

  markAdopted: function(adopters, account) {
    //成功过后执行页面禁止操作
    /*
     * Replace me...
     */
     var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      console.log('adopters ---------------------');
      console.log(adopters);
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
    event.preventDefault();
    var petId = parseInt($(event.target).data('id')); //获取宠物的ID
    console.log('petId -------------------');
    console.log(petId);
    var adoptionInstance;
    // 判断当前数据id是否已经被买走
    //alert('ID不可用');
    //return false  ;
    web3.eth.getAccounts(function(error, accounts) {
      // 与MetaMask进行交互
      console.log('error ------------------');
      
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      console.log('account ------------------');
      console.log(account);
      
      App.contracts.Adoption.deployed().then(function(instance) {
       
        console.log('deal -----------------');
        console.log(instance);
        console.log(account);
       
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        // 交易执行成功  
        console.log('result ----------------');
        console.log(result);
        return App.markAdopted();
      }).catch(function(err) {
        // 交易执行失败
        console.log(err.message);
      });
    });
  }

};
// 页面成功后执行App
$(function() {
  $(window).load(function() {
    App.init();
  });
});
